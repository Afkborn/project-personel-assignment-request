const express = require("express");
const router = express.Router();
const AssignmentRequest = require("../model/AssignmentRequest");
const User = require("../model/User");
const auth = require("../middleware/auth");
const getTimeForLog = require("../common/time");
const Logger = require("../middleware/logger");
const { CourthouseList } = require("../constants/CourthouseList");
const upload = require("../middleware/upload");
const filesPath = process.env.MEDIA_FILES_FOLDER;
const fs = require("fs");
const path = require("path");
const { changeTurkishCharacters } = require("../common/localization");


// Yeni tayin talebi oluştur
router.post(
  "/create",
  auth,
  Logger("POST assignmentrequests/create"),
  async (req, res) => {
    try {
      const {
        currentCourthouse,
        requestedCourthouse,
        reason,
        type,
        documents,
      } = req.body;
      const userId = req.user.id;

      // Zorunlu alanları kontrol et
      if (!currentCourthouse || !requestedCourthouse || !reason) {
        return res.status(400).json({
          message:
            "Mevcut adliye, talep edilen adliye ve talep sebebi gereklidir",
        });
      }

      // Adliye kodlarının geçerli olup olmadığını kontrol et
      const currentCourthouseExists = CourthouseList.some(
        (court) => court.plateCode === parseInt(currentCourthouse)
      );
      const requestedCourthouseExists = CourthouseList.some(
        (court) => court.plateCode === parseInt(requestedCourthouse)
      );

      if (!currentCourthouseExists || !requestedCourthouseExists) {
        return res.status(400).json({
          message: "Geçersiz adliye kodu",
        });
      }

      // Aynı adliyelere talep yapılmamasını kontrol et
      if (parseInt(currentCourthouse) === parseInt(requestedCourthouse)) {
        return res.status(400).json({
          message: "Mevcut adliye ile talep edilen adliye aynı olamaz",
        });
      }

      // Kullanıcının mevcut başvurularını kontrol et
      const existingPendingRequest = await AssignmentRequest.findOne({
        user: userId,
        status: { $in: ["preparing", "pending"] },
      });

      if (existingPendingRequest) {
        return res.status(400).json({
          message:
            "Zaten hazırlanmakta olan veya bekleyen bir tayin talebiniz var",
          requestId: existingPendingRequest._id,
        });
      }

      // Yeni tayin talebi oluştur
      const newRequest = new AssignmentRequest({
        user: userId,
        currentCourthouse,
        requestedCourthouse,
        reason,
        status: "preparing", // Başlangıçta preparing statüsünde
        type: type || "optional", // Varsayılan olarak isteğe bağlı
        documents: documents || [], // Belgeler opsiyonel
        applicationDate: new Date(), // Başvuru tarihi
      });

      await newRequest.save();

      // Adliye isimlerini ekleyerek cevap ver
      const currentCourthouseName =
        CourthouseList.find(
          (court) => court.plateCode === parseInt(currentCourthouse)
        )?.name || "Bilinmiyor";
      const requestedCourthouseName =
        CourthouseList.find(
          (court) => court.plateCode === parseInt(requestedCourthouse)
        )?.name || "Bilinmiyor";

      res.status(201).json({
        message: "Tayin talebi başarıyla oluşturuldu",
        request: {
          ...newRequest.toObject(),
          currentCourthouseName,
          requestedCourthouseName,
        },
      });
    } catch (error) {
      console.error(getTimeForLog() + "Tayin talebi oluşturma hatası:", error);
      res.status(500).json({
        message: "Tayin talebi oluşturulurken bir hata oluştu",
        error: error.message,
      });
    }
  }
);

// Tayin talebini güncelle (sadece 'preparing' durumundayken)
router.put(
  "/update/:id",
  auth,
  Logger("PUT assignmentrequests/update/:id"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { requestedCourthouse, reason, type, documents } = req.body;
      const userId = req.user.id;

      // Talebi bul
      const assignmentRequest = await AssignmentRequest.findOne({
        _id: id,
        user: userId,
      });

      if (!assignmentRequest) {
        return res.status(404).json({
          message: "Tayin talebi bulunamadı",
        });
      }

      // Sadece 'preparing' durumundayken güncellemeye izin ver
      if (assignmentRequest.status !== "preparing") {
        return res.status(400).json({
          message:
            "Sadece hazırlanma aşamasındaki tayin talepleri güncellenebilir",
        });
      }

      // Güncellenecek alanları kontrol et
      if (requestedCourthouse) {
        // Adliye kodunun geçerli olup olmadığını kontrol et
        const requestedCourthouseExists = CourthouseList.some(
          (court) => court.plateCode === parseInt(requestedCourthouse)
        );

        if (!requestedCourthouseExists) {
          return res.status(400).json({
            message: "Geçersiz adliye kodu",
          });
        }

        // Aynı adliyelere talep yapılmamasını kontrol et
        if (
          parseInt(assignmentRequest.currentCourthouse) ===
          parseInt(requestedCourthouse)
        ) {
          return res.status(400).json({
            message: "Mevcut adliye ile talep edilen adliye aynı olamaz",
          });
        }

        assignmentRequest.requestedCourthouse = requestedCourthouse;
      }

      if (reason) {
        assignmentRequest.reason = reason;
      }
      if (type) {
        assignmentRequest.type = type;
      }

      // documents yok ise silinmiş demektir
      if (documents === null || documents === undefined) {
        assignmentRequest.documents = [];
      }

      if (documents && Array.isArray(documents)) {
        assignmentRequest.documents = documents;
      }

      await assignmentRequest.save();

      // Adliye isimlerini ekleyerek cevap ver
      const currentCourthouseName =
        CourthouseList.find(
          (court) =>
            court.plateCode === parseInt(assignmentRequest.currentCourthouse)
        )?.name || "Bilinmiyor";
      const requestedCourthouseName =
        CourthouseList.find(
          (court) =>
            court.plateCode === parseInt(assignmentRequest.requestedCourthouse)
        )?.name || "Bilinmiyor";

      res.status(200).json({
        message: "Tayin talebi başarıyla güncellendi",
        request: {
          ...assignmentRequest.toObject(),
          currentCourthouseName,
          requestedCourthouseName,
        },
      });
    } catch (error) {
      console.error(getTimeForLog() + "Tayin talebi güncelleme hatası:", error);
      res.status(500).json({
        message: "Tayin talebi güncellenirken bir hata oluştu",
        error: error.message,
      });
    }
  }
);

// Tayin talebini onaya sun (statusü 'pending' olarak güncelle)
router.put(
  "/submit/:id",
  auth,
  Logger("PUT assignmentrequests/submit/:id"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Talebi bul
      const request = await AssignmentRequest.findOne({
        _id: id,
        user: userId,
      });

      if (!request) {
        return res.status(404).json({
          message: "Tayin talebi bulunamadı",
        });
      }

      // Sadece 'preparing' durumundayken onaya sunulabilir
      if (request.status !== "preparing") {
        return res.status(400).json({
          message:
            "Sadece hazırlanma aşamasındaki tayin talepleri onaya sunulabilir",
        });
      }

      // Statusü 'pending' olarak güncelle
      request.status = "pending";
      await request.save();

      // Adliye isimlerini ekleyerek cevap ver
      const currentCourthouseName =
        CourthouseList.find(
          (court) => court.plateCode === parseInt(request.currentCourthouse)
        )?.name || "Bilinmiyor";
      const requestedCourthouseName =
        CourthouseList.find(
          (court) => court.plateCode === parseInt(request.requestedCourthouse)
        )?.name || "Bilinmiyor";

      res.status(200).json({
        message: "Tayin talebi başarıyla onaya sunuldu",
        request: {
          ...request.toObject(),
          currentCourthouseName,
          requestedCourthouseName,
        },
      });
    } catch (error) {
      console.error(
        getTimeForLog() + "Tayin talebi onaya sunma hatası:",
        error
      );
      res.status(500).json({
        message: "Tayin talebi onaya sunulurken bir hata oluştu",
        error: error.message,
      });
    }
  }
);

// Tayin talebini iptal et (sadece 'preparing' veya 'pending' durumundayken)
router.delete(
  "/cancel/:id",
  auth,
  Logger("DELETE assignmentrequests/cancel/:id"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Talebi bul
      const assignmentRequest = await AssignmentRequest.findOne({
        _id: id,
        user: userId,
      });

      if (!assignmentRequest) {
        return res.status(404).json({
          message: "Tayin talebi bulunamadı",
        });
      }

      // Sadece 'preparing' veya 'pending' durumundayken iptal edilebilir
      if (
        assignmentRequest.status !== "preparing" &&
        assignmentRequest.status !== "pending"
      ) {
        return res.status(400).json({
          message:
            "Sadece hazırlanma aşamasındaki veya bekleyen tayin talepleri iptal edilebilir",
        });
      }

      // Talebi sil
      await AssignmentRequest.deleteOne({ _id: id });

      res.status(200).json({
        message: "Tayin talebi başarıyla iptal edildi",
      });
    } catch (error) {
      console.error(getTimeForLog() + "Tayin talebi iptal etme hatası:", error);
      res.status(500).json({
        message: "Tayin talebi iptal edilirken bir hata oluştu",
        error: error.message,
      });
    }
  }
);

// Kullanıcının kendi tayin taleplerini listele
router.get(
  "/my-requests",
  auth,
  Logger("GET assignmentrequests/my-requests"),
  async (req, res) => {
    try {
      const userId = req.user.id;

      // Talepleri bul
      const assignmentRequest = await AssignmentRequest.find({
        user: userId,
      })
        .sort({ ["createdAt"]: 1 })
        .exec();

      // Adliye isimlerini ekle
      const requestsWithCourtNames = assignmentRequest.map((request) => {
        const currentCourthouseName =
          CourthouseList.find(
            (court) => court.plateCode === parseInt(request.currentCourthouse)
          )?.name || "Bilinmiyor";
        const requestedCourthouseName =
          CourthouseList.find(
            (court) => court.plateCode === parseInt(request.requestedCourthouse)
          )?.name || "Bilinmiyor";

        return {
          ...request.toObject(),
          currentCourthouseName,
          requestedCourthouseName,
        };
      });

      res.status(200).json({
        message: "Tayin talepleri başarıyla listelendi",
        count: assignmentRequest.length,
        requests: requestsWithCourtNames,
      });
    } catch (error) {
      console.error(
        getTimeForLog() + "Tayin taleplerini listeleme hatası:",
        error
      );
      res.status(500).json({
        message: "Tayin talepleri listelenirken bir hata oluştu",
        error: error.message,
      });
    }
  }
);

// Tayin talebinin detaylarını görüntüle
router.get(
  "/:id",
  auth,
  Logger("GET assignmentrequests/:id"),
  async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      // Kullanıcı rollerini kontrol et
      const isAdmin = req.user.roles.includes("admin");

      // Talebi bul
      let assignmentRequest;

      if (isAdmin) {
        // Admin ise herhangi bir talebi görüntüleyebilir
        assignmentRequest = await AssignmentRequest.findById(id);
      } else {
        // Normal kullanıcı ise sadece kendi taleplerini görüntüleyebilir
        assignmentRequest = await AssignmentRequest.findOne({
          _id: id,
          user: userId,
        });
      }

      if (!assignmentRequest) {
        return res.status(404).json({
          message: "Tayin talebi bulunamadı",
        });
      }

      // İlgili kullanıcı bilgilerini getir
      const user = await User.findById(assignmentRequest.user).select(
        "name surname registrationNumber"
      );

      // Onaylayan veya reddeden kullanıcı bilgilerini getir
      let approvedByUser = null;
      let rejectedByUser = null;

      if (assignmentRequest.approvedBy) {
        approvedByUser = await User.findById(
          assignmentRequest.approvedBy
        ).select("name surname registrationNumber");
      }

      if (assignmentRequest.rejectedBy) {
        rejectedByUser = await User.findById(
          assignmentRequest.rejectedBy
        ).select("name surname registrationNumber");
      }

      // Adliye isimlerini ekle
      const currentCourthouseName =
        CourthouseList.find(
          (court) =>
            court.plateCode === parseInt(assignmentRequest.currentCourthouse)
        )?.name || "Bilinmiyor";
      const requestedCourthouseName =
        CourthouseList.find(
          (court) =>
            court.plateCode === parseInt(assignmentRequest.requestedCourthouse)
        )?.name || "Bilinmiyor";

      res.status(200).json({
        message: "Tayin talebi başarıyla getirildi",
        request: {
          ...assignmentRequest.toObject(),
          currentCourthouseName,
          requestedCourthouseName,
          user,
          approvedByUser,
          rejectedByUser,
        },
      });
    } catch (error) {
      console.error(getTimeForLog() + "Tayin talebi getirme hatası:", error);
      res.status(500).json({
        message: "Tayin talebi getirilirken bir hata oluştu",
        error: error.message,
      });
    }
  }
);

// Tüm tayin taleplerini listele (Sadece admin)
router.get("/", auth, Logger("GET assignmentrequests/"), async (req, res) => {
  try {
    // Yönetici yetkisi kontrolü
    if (!req.user.roles.includes("admin")) {
      return res.status(403).json({
        message: "Bu işlemi gerçekleştirmek için yeterli yetkiniz yok",
      });
    }

    // Filtreleme ve sayfalama için parametreler
    const { status, courtId, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Filtreleme koşulları
    const filter = {};

    if (
      status &&
      ["preparing", "pending", "approved", "rejected"].includes(status)
    ) {
      filter.status = status;
    }

    if (courtId) {
      filter.$or = [
        { currentCourthouse: parseInt(courtId) },
        { requestedCourthouse: parseInt(courtId) },
      ];
    }

    // Talepleri say ve getir
    const totalCount = await AssignmentRequest.countDocuments(filter);

    const requests = await AssignmentRequest.find(filter)
      .populate("user", "name surname registrationNumber")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .exec();

    // Adliye isimlerini ekle
    const requestsWithCourtNames = requests.map((request) => {
      const currentCourthouseName =
        CourthouseList.find(
          (court) => court.plateCode === parseInt(request.currentCourthouse)
        )?.name || "Bilinmiyor";
      const requestedCourthouseName =
        CourthouseList.find(
          (court) => court.plateCode === parseInt(request.requestedCourthouse)
        )?.name || "Bilinmiyor";

      return {
        ...request.toObject(),
        currentCourthouseName,
        requestedCourthouseName,
      };
    });

    res.status(200).json({
      message: "Tayin talepleri başarıyla listelendi",
      totalCount,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(totalCount / limit),
      requests: requestsWithCourtNames,
    });
  } catch (error) {
    console.error(
      getTimeForLog() + "Tayin taleplerini listeleme hatası:",
      error
    );
    res.status(500).json({
      message: "Tayin talepleri listelenirken bir hata oluştu",
      error: error.message,
    });
  }
});

// Tayin talebini onayla (Sadece admin)
router.put(
  "/approve/:id",
  auth,
  Logger("PUT assignmentrequests/approve/:id"),
  async (req, res) => {
    try {
      // Yönetici yetkisi kontrolü
      if (!req.user.roles.includes("admin")) {
        return res.status(403).json({
          message: "Bu işlemi gerçekleştirmek için yeterli yetkiniz yok",
        });
      }

      const { id } = req.params;

      // Talebi bul
      const assignmentRequest = await AssignmentRequest.findById(id);

      if (!assignmentRequest) {
        return res.status(404).json({
          message: "Tayin talebi bulunamadı",
        });
      }

      // Sadece bekleyen talepler onaylanabilir
      if (assignmentRequest.status !== "pending") {
        return res.status(400).json({
          message: "Sadece bekleyen talepler onaylanabilir",
        });
      }

      // Talebi onayla
      assignmentRequest.status = "approved";
      assignmentRequest.approvedBy = req.user.id;
      assignmentRequest.approvedAt = new Date();

      await assignmentRequest.save();

      // Adliye isimlerini ekle
      const currentCourthouseName =
        CourthouseList.find(
          (court) =>
            court.plateCode === parseInt(assignmentRequest.currentCourthouse)
        )?.name || "Bilinmiyor";
      const requestedCourthouseName =
        CourthouseList.find(
          (court) =>
            court.plateCode === parseInt(assignmentRequest.requestedCourthouse)
        )?.name || "Bilinmiyor";

      // Kullanıcının adliye bilgisini güncelle
      await User.findByIdAndUpdate(assignmentRequest.user, {
        courtId: assignmentRequest.requestedCourthouse,
      });

      res.status(200).json({
        message: "Tayin talebi başarıyla onaylandı",
        request: {
          ...assignmentRequest.toObject(),
          currentCourthouseName,
          requestedCourthouseName,
        },
      });
    } catch (error) {
      console.error(getTimeForLog() + "Tayin talebi onaylama hatası:", error);
      res.status(500).json({
        message: "Tayin talebi onaylanırken bir hata oluştu",
        error: error.message,
      });
    }
  }
);

// Tayin talebini reddet (Sadece admin)
router.put(
  "/reject/:id",
  auth,
  Logger("PUT assignmentrequests/reject/:id"),
  async (req, res) => {
    try {
      // Yönetici yetkisi kontrolü
      if (!req.user.roles.includes("admin")) {
        return res.status(403).json({
          message: "Bu işlemi gerçekleştirmek için yeterli yetkiniz yok",
        });
      }

      const { id } = req.params;
      const { rejectionReason } = req.body;

      if (!rejectionReason) {
        return res.status(400).json({
          message: "Ret sebebi belirtilmelidir",
        });
      }

      // Talebi bul
      const assignmentRequest = await AssignmentRequest.findById(id);

      if (!assignmentRequest) {
        return res.status(404).json({
          message: "Tayin talebi bulunamadı",
        });
      }

      // Sadece bekleyen talepler reddedilebilir
      if (assignmentRequest.status !== "pending") {
        return res.status(400).json({
          message: "Sadece bekleyen talepler reddedilebilir",
        });
      }

      // Talebi reddet
      assignmentRequest.status = "rejected";
      assignmentRequest.rejectionReason = rejectionReason;
      assignmentRequest.rejectedBy = req.user.id;
      assignmentRequest.rejectedAt = new Date();

      await assignmentRequest.save();

      // Adliye isimlerini ekle
      const currentCourthouseName =
        CourthouseList.find(
          (court) =>
            court.plateCode === parseInt(assignmentRequest.currentCourthouse)
        )?.name || "Bilinmiyor";
      const requestedCourthouseName =
        CourthouseList.find(
          (court) =>
            court.plateCode === parseInt(assignmentRequest.requestedCourthouse)
        )?.name || "Bilinmiyor";

      res.status(200).json({
        message: "Tayin talebi başarıyla reddedildi",
        request: {
          ...assignmentRequest.toObject(),
          currentCourthouseName,
          requestedCourthouseName,
        },
      });
    } catch (error) {
      console.error(getTimeForLog() + "Tayin talebi reddetme hatası:", error);
      res.status(500).json({
        message: "Tayin talebi reddedilirken bir hata oluştu",
        error: error.message,
      });
    }
  }
);

// tayin talebi evraklarını sunucuya yükle
router.post(
  "/upload",
  auth,
  upload.array("documents", 5), // Maksimum 5 dosya yüklenebilir
  Logger("POST assignmentrequests/upload/:id"),
  async (req, res) => {
    try {
      const userId = req.user.id;

      // Evrakları kontrol et
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({
          message: "En az bir evrak yüklenmelidir",
        });
      }

      // Evrakları talebe ekle
      const documents = req.files.map((file) => {
        // Dosya adını ve yolunu kaydet

        const oldPath = file.path;
        let fileName = file.originalname;
        console.log(getTimeForLog() + "Yüklenen dosya:", fileName);
        fileName = changeTurkishCharacters(fileName);
        console.log(
          getTimeForLog() + "Türkçe karakterler değiştirildi:",
          fileName
        );
        fileName = fileName
          .replace(/\s+/g, "_")
          .replace(/[^a-zA-Z0-9_.-]/g, "");
        const uniqueFileName = `${userId}-${fileName}`;
        const newPath = path.join(filesPath, uniqueFileName);

        fs.copyFileSync(oldPath, newPath);
        return uniqueFileName;
      });

      // dosya yollarını response olarak dön
      res.status(200).json({
        message: "Evraklar başarıyla yüklendi",
        documents: documents.map((doc) => ({
          originalName: doc.replace(userId + "-", ""),
          filename: doc,
          url: `${filesPath}/${doc}`,
        })),
      });
    } catch (error) {
      console.error(getTimeForLog() + "Evrak yükleme hatası:", error);
      res.status(500).json({
        message: "Evrak yüklenirken bir hata oluştu",
        error: error.message,
      });
    }
  }
);

module.exports = router;
