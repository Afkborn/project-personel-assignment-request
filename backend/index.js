const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoDbConnect = require("./database/Database");
const getTimeForLog = require("./common/time");
const { initRedis } = require("./config/Redis");
const path = require("path");
const port = process.env.PORT || 3000;
require("dotenv").config();

// Tüm ortam değişkenlerini kontrol et
const requiredEnvVars = [
  "PORT",
  "MONGO_DB_CONNECTION",
  "SALT_CODE",
  "REDIS_URL",
  "RANDOM_TOKEN",
  "DEFAULT_ADMIN_REGISTRATION_NUMBER",
  "DEFAULT_ADMIN_PASSWORD",
  
  "MEDIA_ROOT_FOLDER",
  "MEDIA_TEMP_FOLDER",
  "MEDIA_AVATAR_FOLDER",
  "MEDIA_FILES_FOLDER",

  "MAX_LOGIN_ATTEMPTS",
  "LOCKOUT_DURATION",
];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(
      getTimeForLog() + `Hata: ${envVar} ortam değişkeni tanımlanmamış!`
    );
    process.exit(1); // Uygulamayı durdur
  }
});

// Redis bağlantısını başlat
initRedis().then((isConnected) => {
  if (isConnected) {
    console.log(getTimeForLog() + "Redis servisi hazır");
  } else {
    console.warn(
      getTimeForLog() +
        "Redis servisi hazır değil, bazı özellikler sınırlı olabilir"
    );
  }
});

// body-parser'ı kullanarak URL kodlu gövde verilerini ayrıştırır
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);

// CORS'u etkinleştirir
app.use(cors());

// JSON gövde verilerini ayrıştırmak için body-parser'ı kullanır
app.use(bodyParser.json());

// Statik dosyaları sunmak için express.static middleware'ini kullanır
app.use(
  "/media",
  express.static(
    path.join(__dirname, "..", process.env.MEDIA_FOLDER || "media")
  )
);

// API'leri tanımla
const users = require("./routes/users");
app.use("/api/users", users);

const courthouses = require("./routes/courthouses");
app.use("/api/courthouses", courthouses);

const assignmentRequests = require("./routes/assignmentRequests");
app.use("/api/assignment-requests", assignmentRequests);

mongoDbConnect(); // MongoDB bağlantısını başlat

// eğer veritabanında admin kullanıcısı yoksa oluştur
const { createAdminUser } = require("./actions/DatabaseActions");
createAdminUser();

// Sunucuyu başlat
app.listen(port, () => {
  console.log(getTimeForLog() + `${port} portunda backend sunucu çalışıyor`);
});
