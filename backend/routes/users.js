const Messages = require("../constants/Messages");
const express = require("express");
const router = express.Router();
const User = require("../model/User");
const jwt = require("jsonwebtoken");
const getTimeForLog = require("../common/time");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const toSHA256 = require("../common/hashing");
const fs = require("fs");
const path = require("path");
const mediaAvatarPath = process.env.MEDIA_AVATAR_FOLDER;
const {
  redisClient,
  isConnected,
  invalidateAllUserTokens,
  addToBlacklist,
  isValidToken,
} = require("../config/Redis");
const Logger = require("../middleware/logger");
const { RoleList } = require("../constants/RoleList");
require("dotenv").config();
const { CourthouseList } = require("../constants/CourthouseList");

const MAX_LOGIN_ATTEMPTS = process.env.MAX_LOGIN_ATTEMPTS || 5; // Maksimum giriş denemesi sayısı
const LOCKOUT_DURATION = process.env.LOCKOUT_DURATION || 60; // 5 dakika (saniye cinsinden)

router.post("/login", async (request, response) => {
  const requiredFields = ["registrationNumber", "password"];
  const { registrationNumber, rememberMe } = request.body;
  const missingFields = requiredFields.filter((field) => !request.body[field]);
  if (missingFields.length > 0) {
    return response.status(400).send({
      success: false,
      message: `${missingFields.join(", ")} ${Messages.REQUIRED_FIELD}`,
    });
  }

  try {
    const user = await User.findOne({ registrationNumber });
    if (!user) {
      return response.status(404).send({
        message: Messages.USER_NOT_FOUND,
      });
    }

    // Önce kullanıcının kilitli olup olmadığını kontrol et
    let attempts = 0;
    let lockedUntil = null;
    let redisAvailable = false;

    if (redisClient && isConnected()) {
      try {
        const rc = redisClient();
        redisAvailable = true;

        // Multi-get ile tek seferde hem deneme sayısını hem de kilit durumunu kontrol et
        // Bu sayede Redis'e yapılan istek sayısını azaltıyoruz
        const [currentAttempts, lockTimestamp] = await Promise.all([
          rc.get(`loginAttempts:${user.username}`),
          rc.get(`loginLock:${user.username}`),
        ]);

        // Redis'te veri bulunursa kullan, bulunmazsa varsayılan değerleri kullan
        if (currentAttempts) {
          attempts = parseInt(currentAttempts);
        }

        if (lockTimestamp) {
          const now = Math.floor(Date.now() / 1000);
          const lockTime = parseInt(lockTimestamp);

          if (now < lockTime) {
            // Kilit süresi henüz geçmemiş
            const remainingSeconds = lockTime - now;
            const remainingMinutes = Math.ceil(remainingSeconds / 60);

            return response.status(429).send({
              message: `Çok fazla hatalı giriş denemesi. Hesabınız geçici olarak kilitlendi. ${remainingMinutes} dakika sonra tekrar deneyiniz.`,
              lockedUntil: new Date(lockTime * 1000),
              remainingAttempts: 0,
            });
          } else {
            // Kilit süresi geçmiş, kilidi kaldır
            await rc.del(`loginLock:${user.username}`);
            await rc.del(`loginAttempts:${user.username}`);
            attempts = 0;
          }
        }
      } catch (redisError) {
        console.error(getTimeForLog() + "Redis lock check error:", redisError);
        redisAvailable = false;
        // Redis hata verirse, güvenli modda devam et
        attempts = 0; // Redis olmadan hata sayısını takip edemeyiz, en güvenlisi sıfırlamaktır
      }
    }

    // Şifre yanlış ise
    if (user.password !== toSHA256(request.body.password)) {
      attempts++; // Hatalı giriş sayısını artır

      // Eğer Redis bağlantısı varsa, hatalı giriş sayısını artır
      if (redisAvailable) {
        try {
          const rc = redisClient();

          // Hatalı giriş sayısını güncelle
          const key = `loginAttempts:${user.username}`;
          const value = attempts.toString();
          await rc.setEx(key, LOCKOUT_DURATION, value);

          // Eğer maksimum denemeye ulaşıldıysa hesabı kilitle
          if (attempts >= MAX_LOGIN_ATTEMPTS) {
            const lockUntil = Math.floor(Date.now() / 1000) + LOCKOUT_DURATION;
            await rc.setEx(
              `loginLock:${user.username}`,
              LOCKOUT_DURATION,
              lockUntil.toString()
            );

            console.log(
              getTimeForLog() +
                `\rUser ${user.username} account locked until ${new Date(
                  lockUntil * 1000
                )}`
            );

            return response.status(429).send({
              message: `Çok fazla hatalı giriş denemesi. Hesabınız 30 dakika süreyle kilitlendi.`,
              lockedUntil: new Date(lockUntil * 1000),
              remainingAttempts: 0,
            });
          }

          console.log(
            getTimeForLog() +
              `Login attempts for ${user.username} updated to ${attempts}`
          );
        } catch (redisError) {
          console.error(getTimeForLog() + "Redis error:", redisError);
        }
      } else {
        console.log(
          getTimeForLog() +
            `Redis unavailable, cannot track login attempts for ${user.username}`
        );
      }

      const remainingAttempts = redisAvailable
        ? Math.max(0, MAX_LOGIN_ATTEMPTS - attempts)
        : 1;
      const attemptsMessage =
        remainingAttempts > 0
          ? `Kalan giriş hakkı: ${remainingAttempts}`
          : "Çok fazla hatalı giriş denemesi. Hesabınız kilitlendi.";

      return response.status(401).send({
        message: `${Messages.PASSWORD_INCORRECT}. ${attemptsMessage}`,
        remainingAttempts: remainingAttempts,
      });
    }

    // Şifre doğru ise, hatalı giriş sayısını ve kilidi sıfırla
    if (redisAvailable) {
      try {
        const rc = redisClient();
        await rc.del(`loginAttempts:${user.username}`);
        await rc.del(`loginLock:${user.username}`);
        console.log(
          getTimeForLog() +
            `Login attempts and locks reset for ${user.username} after successful login`
        );
      } catch (redisError) {
        console.error(
          getTimeForLog() + "Redis error when resetting login attempts:",
          redisError
        );
      }
    }

    const tokenExpiry = rememberMe ? "7d" : "24h";

    const token = jwt.sign(
      {
        id: user._id,
        registrationNumber: user.registrationNumber,
        roles: user.roles,
      },
      process.env.RANDOM_TOKEN,
      {
        expiresIn: tokenExpiry,
      }
    );

    const clientIP =
      request.headers["x-forwarded-for"] || request.socket.remoteAddress;
    console.log(
      getTimeForLog() + "User",
      user.registrationNumber,
      "logged in with token [" + clientIP + "]"
    );

    response.status(200).send({
      message: "Giriş başarılı",
      user: {
        id: user._id,
        registrationNumber: user.registrationNumber,
        name: user.name,
        surname: user.surname,
        roles: user.roles,
      },
      token,
    });
  } catch (error) {
    console.error(getTimeForLog() + "Login error:", error);
    response.status(500).send({
      message: "Giriş yapılırken bir hata oluştu",
      error: error.message,
    });
  }
});

// Kullanıcı kaydı
router.post(
  "/register",
  Logger("POST users/register"),
  async (request, response) => {
    try {
      const {
        registrationNumber,
        name,
        surname,
        password,
        roles,
        email,
        phoneNumber,
        tckn,
        isMartyrRelative,
        isDisabled,
        birthDate,
        birthPlace,
        bloodType,
        keyboardType,
        careerStartDate,
        courtId,
        unitName,
        unitStartDate,
      } = request.body;

      // Zorunlu alanları kontrol et
      if (!registrationNumber || !name || !surname || !password || !roles) {
        return response.status(400).send({
          message: "Zorunlu alanlar eksik",
        });
      }

      // Sicil numarası daha önce kullanılmış mı kontrol et
      const existingUser = await User.findOne({ registrationNumber });
      if (existingUser) {
        return response.status(409).send({
          message: Messages.REGISTRATION_NUMBER_EXIST,
        });
      }

      // Şifreyi SHA-256 ile hashle
      const hashedPassword = toSHA256(password);

      // Yeni kullanıcı oluştur
      const newUser = new User({
        registrationNumber,
        name,
        surname,
        password: hashedPassword,
        roles: roles || ["user"],
        email,
        phoneNumber,
        tckn,

        isMartyrRelative: isMartyrRelative || false,
        isDisabled: isDisabled || false,
        birthDate,
        birthPlace,
        bloodType: bloodType || "",
        keyboardType: keyboardType || "",
        careerStartDate,
        courtId: courtId || 0,
        unitName: unitName || "Bilinmiyor",
        unitStartDate,
      });

      // Kullanıcıyı kaydet
      await newUser.save();

      response.status(201).send({
        message: "Kullanıcı başarıyla oluşturuldu",
        user: {
          id: newUser._id,
          registrationNumber: newUser.registrationNumber,
          name: newUser.name,
          surname: newUser.surname,
          roles: newUser.roles,
        },
      });
    } catch (error) {
      // Mongoose doğrulama hatalarını kontrol et
      if (error.name === "ValidationError") {
        return response.status(400).send({
          message: "Doğrulama hatası",
          errors: Object.values(error.errors).map((err) => err.message),
        });
      }

      console.error(getTimeForLog() + "Register error:", error);
      response.status(500).send({
        message: "Kullanıcı kaydedilirken bir hata oluştu",
        error: error.message,
      });
    }
  }
);

// Kullanıcı detaylarını getir
router.get("/me", auth, Logger("GET users/me"), async (request, response) => {
  try {
    const userId = request.user.id;
    let user = await User.findById(userId).select("-password");

    if (!user) {
      return response.status(404).send({
        message: "Kullanıcı bulunamadı",
      });
    }
    user = user.toObject(); // Mongoose dokümanını düz JavaScript nesnesine çevir, ekleme çıkartmak yapmak için bunu yapıyoruyz.

    // user.courtIdyi  CourthouseList'ten adliye bilgisi ile doldur
    const courthouse = CourthouseList.find(
      (court) => court.plateCode === user.courtId
    );

    if (courthouse) {
      //delete user.courtId; // courtId'yi kaldır
      user.court = {
        plateCode: courthouse.plateCode,
        name: courthouse.name,
        address: courthouse.address,
      };
    }

    // kullanıcının rollerini al RoleList'den bulup label ve name ile doldur
    user.rolesVisible = user.roles.map((role) => {
      const roleInfo = RoleList.find((r) => r.name === role);
      return {
        id: roleInfo.id,
        label: roleInfo.label,
        name: roleInfo.name,
      };
    });

    response.status(200).send({
      user,
    });
  } catch (error) {
    console.error(getTimeForLog() + "Get user details error:", error);
    response.status(500).send({
      message: "Kullanıcı bilgileri alınırken bir hata oluştu",
      error: error.message,
    });
  }
});

// Kullanıcı bilgilerini güncelle
router.put(
  "/update",
  auth,
  Logger("PUT users/update"),
  async (request, response) => {
    try {
      // Kullanıcı kimliğini auth middleware'den al
      const userId = request.user.id;
      const updateData = request.body;

      delete updateData.password;
      delete updateData.roles;
      delete updateData.registrationNumber;

      // Kullanıcıyı güncelle
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: updateData },
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser) {
        return response.status(404).send({
          message: "Kullanıcı bulunamadı",
        });
      }

      response.status(200).send({
        message: "Kullanıcı bilgileri güncellendi",
        user: updatedUser,
      });
    } catch (error) {
      if (error.name === "ValidationError") {
        return response.status(400).send({
          message: "Doğrulama hatası",
          errors: Object.values(error.errors).map((err) => err.message),
        });
      }

      console.error(getTimeForLog() + "Update user error:", error);
      response.status(500).send({
        message: "Kullanıcı güncellenirken bir hata oluştu",
        error: error.message,
      });
    }
  }
);

// Kullanıcı hesabını sil (kendi hesabını)
router.delete(
  "/delete",
  auth,
  Logger("DELETE users/delete"),
  async (request, response) => {
    try {
      // Kullanıcı kimliğini auth middleware'den al
      const userId = request.user.id;

      // Kullanıcıyı sil
      const deletedUser = await User.findByIdAndDelete(userId);

      if (!deletedUser) {
        return response.status(404).send({
          message: "Kullanıcı bulunamadı",
        });
      }

      // Kullanıcının tüm token'larını geçersiz kıl
      await invalidateAllUserTokens(userId);

      response.status(200).send({
        message: "Kullanıcı hesabı başarıyla silindi",
      });
    } catch (error) {
      console.error(getTimeForLog() + "Delete user error:", error);
      response.status(500).send({
        message: "Kullanıcı silinirken bir hata oluştu",
        error: error.message,
      });
    }
  }
);

// Admin: ID ile kullanıcı sil
router.delete(
  "/:id",
  auth,
  Logger("DELETE users/:id"),
  async (request, response) => {
    try {
      // Kullanıcı yetkilerini kontrol et
      if (!request.user.roles.includes("admin")) {
        return response.status(403).send({
          message: "Bu işlem için yetkiniz bulunmamaktadır",
        });
      }

      const userId = request.params.id;

      // Kullanıcıyı sil
      const deletedUser = await User.findByIdAndDelete(userId);

      if (!deletedUser) {
        return response.status(404).send({
          message: "Kullanıcı bulunamadı",
        });
      }

      // Kullanıcının tüm token'larını geçersiz kıl
      await invalidateAllUserTokens(userId);

      response.status(200).send({
        message: "Kullanıcı hesabı başarıyla silindi",
      });
    } catch (error) {
      console.error(getTimeForLog() + "Admin delete user error:", error);
      response.status(500).send({
        message: "Kullanıcı silinirken bir hata oluştu",
        error: error.message,
      });
    }
  }
);

// Admin: Tüm kullanıcıları listele
router.get("/all", auth, Logger("GET users/all"), async (request, response) => {
  try {
    // Kullanıcı yetkilerini kontrol et
    if (!request.user.roles.includes("admin")) {
      return response.status(403).send({
        message: "Bu işlem için yetkiniz bulunmamaktadır",
      });
    }

    // Sayfalama için parametreler
    const page = parseInt(request.query.page) || 1;
    const limit = parseInt(request.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Kullanıcıları getir (şifreler hariç)
    const users = await User.find()
      .select("-password")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Toplam kullanıcı sayısını getir
    const total = await User.countDocuments();

    response.status(200).send({
      users,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(getTimeForLog() + "Get all users error:", error);
    response.status(500).send({
      message: "Kullanıcılar listelenirken bir hata oluştu",
      error: error.message,
    });
  }
});

// Tüm kullanıcıların isim ve soyisimlerini listele
router.get(
  "/names",
  auth,
  Logger("GET users/names"),
  async (request, response) => {
    try {
      // Sadece isim ve soyisim bilgilerini getir
      const users = await User.find()
        .select("name surname registrationNumber")
        .sort({ name: 1, surname: 1 });

      response.status(200).send({
        users: users.map((user) => ({
          id: user._id,
          name: user.name,
          surname: user.surname,
          registrationNumber: user.registrationNumber,
          fullName: `${user.name} ${user.surname}`,
        })),
      });
    } catch (error) {
      console.error(getTimeForLog() + "Get user names error:", error);
      response.status(500).send({
        message: "Kullanıcı isimleri listelenirken bir hata oluştu",
        error: error.message,
      });
    }
  }
);

// logout user
router.post(
  "/logout",
  auth,
  Logger("POST users/logout"),
  async (request, response) => {
    try {
      // Token'ı header'dan al
      const token = request.headers.authorization.split(" ")[1];

      // Token'ın süresi kaç saniye kaldığını hesapla
      const decoded = jwt.decode(token);
      const expiresIn = decoded.exp - Math.floor(Date.now() / 1000);

      // Token'ı blacklist'e ekle
      const result = await addToBlacklist(token, expiresIn);

      if (result) {
        const clientIP =
          request.headers["x-forwarded-for"] || request.socket.remoteAddress;
        console.log(
          getTimeForLog() + "User",
          request.user.registrationNumber,
          "logged out [" + clientIP + "]"
        );

        response.status(200).send({
          message: "Başarıyla çıkış yapıldı",
        });
      } else {
        response.status(500).send({
          message: "Çıkış işlemi sırasında bir hata oluştu",
        });
      }
    } catch (error) {
      response.status(500).send({
        message: "Çıkış yapılırken bir hata oluştu",
        error: error.message,
      });
    }
  }
);

// validate token endpoint
router.post("/validate-token", async (request, response) => {
  try {
    // Token'ı authorization header'dan al
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return response.status(400).send({
        success: false,
        message: "Authorization başlığında geçerli bir Bearer token bulunamadı",
        valid: false,
      });
    }

    // Bearer prefix'ini kaldır ve token'ı al
    const token = authHeader.substring(7);

    if (!token || token.trim() === "") {
      return response.status(400).send({
        success: false,
        message: "Token gereklidir",
        valid: false,
      });
    }

    try {
      // Token'ı doğrula
      const decodedToken = jwt.verify(token, process.env.RANDOM_TOKEN);

      // console.log(
      //   getTimeForLog() +
      //     `Validating token for user ${decodedToken.username} (${decodedToken.id})`
      // );

      // Token'ın blacklist'te olup olmadığını ve versiyon kontrolünü yap
      const tokenValid = await isValidToken(token);

      if (!tokenValid) {
        // console.log(
        //   getTimeForLog() +
        //     `Token validation failed for ${decodedToken.username}`
        // );
        return response.status(401).send({
          success: false,
          message: "Token geçersiz veya oturum sonlandırılmış",
          valid: false,
        });
      }

      // console.log(
      //   getTimeForLog() +
      //     `Token validated successfully for ${decodedToken.username}`
      // );

      // Token geçerliyse kullanıcı bilgilerini döndür (password hariç)
      response.status(200).send({
        success: true,
        message: "Token geçerlidir",
        valid: true,
        user: {
          id: decodedToken.id,
          username: decodedToken.username,
          roles: decodedToken.roles,
        },
        expiresAt: new Date(decodedToken.exp * 1000), // Unix timestamp'i tarih formatına çevir
      });
    } catch (jwtError) {
      // JWT doğrulama hatası (süresi dolmuş, hatalı format, vs.)
      console.error(
        getTimeForLog() + "JWT verification error:",
        jwtError.message
      );
      return response.status(401).send({
        success: false,
        message: "Token geçersiz: " + jwtError.message,
        valid: false,
      });
    }
  } catch (error) {
    console.error(getTimeForLog() + "General token validation error:", error);
    response.status(500).send({
      success: false,
      message: "Token doğrulanırken bir hata oluştu",
      error: error.message,
      valid: false,
    });
  }
});

// get roles from RoleList
router.get("/roles", Logger("GET users/roles"), async (request, response) => {
  try {
    // Rol listesinden selectable false olanları filtrele
    const filteredRoleList = RoleList.filter((role) => role.selectable);

    const roles = filteredRoleList.map((role) => {
      return {
        id: role.id,
        label: role.label,
        name: role.name,
      };
    });

    // Rol listesini döndür
    response.status(200).send({
      roles,
    });
  } catch (error) {
    console.error(getTimeForLog() + "Get roles error:", error);
    response.status(500).send({
      message: "Roller alınırken bir hata oluştu",
      error: error.message,
    });
  }
});

// Kullanıcı resmi yükleme
router.post(
  "/upload-avatar",
  auth,
  upload.single("avatar"),
  Logger("POST users/upload-avatar"),
  async (request, response) => {
    try {
      // Kullanıcı kimliğini auth middleware'den al
      const userId = request.user.id;

      // Kullanıcıyı veritabanından bul
      const user = await User.findById(userId).select("-password");
      if (!user) {
        return response.status(404).send({
          message: "Kullanıcı bulunamadı",
        });
      }

      // Resim dosyasını kontrol et
      if (!request.file) {
        return response.status(400).send({
          message: "Resim dosyası yüklenmedi",
        });
      }

      const oldPath = request.file.path;
      const newPath = path.join(
        mediaAvatarPath,
        userId + path.extname(request.file.originalname)
      );

      // Dosyayı media klasörüne kopyala
      fs.copyFileSync(oldPath, newPath);

      // Kullanıcının avatar URL'sini güncelle
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { avatar: newPath },
        { new: true, runValidators: true }
      ).select("-password");

      if (!updatedUser) {
        return response.status(404).send({
          message: "Kullanıcı bulunamadı",
        });
      }

      response.status(200).send({
        message: "Avatar başarıyla yüklendi",
        user: updatedUser,
      });
    } catch (error) {
      console.error(getTimeForLog() + "Upload avatar error:", error);
      response.status(500).send({
        message: "Avatar yüklenirken bir hata oluştu",
        error: error.message,
      });
    }
  }
);

module.exports = router;
