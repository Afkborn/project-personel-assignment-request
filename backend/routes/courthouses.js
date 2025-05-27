const express = require("express");
const router = express.Router();
const { CourthouseList } = require("../constants/CourthouseList");
const Logger = require("../middleware/logger");

// Tüm adliyeleri listele
router.get("/list", Logger("GET courthouse/list"), async (request, response) => {
  try {
    // CourthouseList'i plaka koduna göre sırala (0 en sonda olacak şekilde)
    const sortedCourthouses = [...CourthouseList].sort((a, b) => {
      if (a.plateCode === 0) return 1;
      if (b.plateCode === 0) return -1;
      return a.plateCode - b.plateCode;
    });

    response.status(200).send({
      message: "Adliyeler başarıyla listelendi",
      courthouses: sortedCourthouses
    });
  } catch (error) {
    console.error("Adliye listesi hatası:", error);
    response.status(500).send({
      message: "Adliyeler listelenirken bir hata oluştu",
      error: error.message
    });
  }
});

// Plaka kodu ile adliye ara
router.get("/search/:plateCode", Logger("GET courthouse/search/:plateCode"), async (request, response) => {
  try {
    const plateCode = parseInt(request.params.plateCode);
    
    if (isNaN(plateCode)) {
      return response.status(400).send({
        message: "Geçersiz plaka kodu formatı"
      });
    }

    const courthouse = CourthouseList.find(court => court.plateCode === plateCode);
    
    if (!courthouse) {
      return response.status(404).send({
        message: `${plateCode} plaka kodlu adliye bulunamadı`
      });
    }

    response.status(200).send({
      message: "Adliye bulundu",
      courthouse
    });
  } catch (error) {
    console.error("Adliye arama hatası:", error);
    response.status(500).send({
      message: "Adliye aranırken bir hata oluştu",
      error: error.message
    });
  }
});

// İsimle adliye ara (kısmi eşleşme ile)
router.get("/search", Logger("GET courthouse/search"), async (request, response) => {
  try {
    const searchQuery = request.query.name;
    
    if (!searchQuery) {
      return response.status(400).send({
        message: "Arama sorgusu gereklidir"
      });
    }

    const matchingCourthouses = CourthouseList.filter(courthouse => 
      courthouse.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    response.status(200).send({
      message: "Arama sonuçları",
      count: matchingCourthouses.length,
      courthouses: matchingCourthouses
    });
  } catch (error) {
    console.error("Adliye arama hatası:", error);
    response.status(500).send({
      message: "Adliye aranırken bir hata oluştu",
      error: error.message
    });
  }
});

module.exports = router;