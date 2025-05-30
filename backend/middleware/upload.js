const multer = require("multer");
const path = require("path");
const fs = require("fs");

const mediaPath = process.env.MEDIA_ROOT_FOLDER;
const mediaTempPath = process.env.MEDIA_TEMP_FOLDER;
const mediaAvatarPath = process.env.MEDIA_AVATAR_FOLDER;
const mediaFilesPath = process.env.MEDIA_FILES_FOLDER;

// Eğer media klasörü yoksa oluştur
if (!fs.existsSync(mediaPath)) {
  fs.mkdirSync(mediaPath, { recursive: true });
}
// Eğer media/temp klasörü yoksa oluştur
if (!fs.existsSync(mediaTempPath)) {
  fs.mkdirSync(mediaTempPath, { recursive: true });
}

// Eğer media/avatar klasörü yoksa oluştur
if (!fs.existsSync(mediaAvatarPath)) {
  fs.mkdirSync(mediaAvatarPath, { recursive: true });
}

// Eğer medaia/files klasörü yoksa oluştur
if (!fs.existsSync(mediaFilesPath)) {
  fs.mkdirSync(mediaFilesPath, { recursive: true });
}

// Dosya depolama ayarları
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, mediaTempPath);
  },
  filename: function (req, file, cb) {
    const uniqueName = file.originalname.replace(/\s+/g, "_");
    cb(null, uniqueName);
  },
});

const upload = multer({ storage: storage });

// Middleware fonksiyonu
module.exports = upload;
