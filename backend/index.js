const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const mongoDbConnect = require("./database/Database");
const getTimeForLog = require("./common/time");
const { initRedis } = require("./config/redis");
require("dotenv").config();
const port = process.env.PORT || 3000;

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

// API'leri tanımla


mongoDbConnect(); // MongoDB bağlantısını başlat


// Sunucuyu başlat
app.listen(port, () => {
  console.log(getTimeForLog() + `${port} portunda backend sunucu çalışıyor`);
});
