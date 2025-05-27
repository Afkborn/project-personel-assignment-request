const axios = require('axios');
const xml2js = require('xml2js');
const fs = require('fs');

// Mahkeme türleri ve il numaraları
const mahkemeTurleri = [
  '0901', '0926', '0927', '0921', '0935', '7702', '7703',
  '0917', '0929', '0911', '0928', '0914', '0913', '0924',
  '0925', '0909', '0918', '0915', '0908', '0907', '0931',
  '0923', '0904', '0902', '0930', '0910', '0912', '0919', '0934'
];
const iller = Array.from({ length: 81 }, (_, i) => i + 1);

// CSV başlığı
let csvData = 'ilNumarasi,birimID,birimAdi\n';

async function fetchMahkemeler() {
  for (const il of iller) {
    for (const tur of mahkemeTurleri) {
      try {
        const response = await axios.post(
          'https://vatandasilam.yargitay.gov.tr/proxyYargitay/selectMahkeme.ajx',
          new URLSearchParams({ il: il.toString(), mahkemeTur: tur }).toString(),
          {
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded'
            }
          }
        );

        const parsed = await xml2js.parseStringPromise(response.data);
        const mahkemeler = parsed.root?.['object-array']?.[0]?.list?.[0]?.YargitaySorguBirimDVO || [];

        for (const mahkeme of mahkemeler) {
          const birimID = mahkeme.birimID?.[0];
          const birimAdi = mahkeme.birimAdi?.[0]?.replace(/,/g, ''); // CSV uyumu için virgül temizliği
          if (birimID && birimAdi) {
            csvData += `${il},${birimID},${birimAdi}\n`;
          }
        }

        console.log(`✔️  İl ${il} - Tür ${tur} işlendi. ${mahkemeler.length} kayıt alındı.`);
      } catch (error) {
        console.warn(`❌ Hata: İl ${il}, Tür ${tur} - ${error.message}`);
      }
    }
  }

  // CSV dosyasını yaz
  fs.writeFileSync('mahkemeler.csv', csvData, 'utf8');
  console.log('✅ CSV dosyası oluşturuldu: mahkemeler.csv');
}

fetchMahkemeler();


// Bu script mahkeme türleri ve il numaraları için Yargıtay'ın API'sinden mahkeme bilgilerini çekip, bunları bir CSV dosyasına kaydeder.
// Katip kayıt ekranında birim seçme için kullanılabilir.