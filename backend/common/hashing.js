const crypto = require("crypto");
require("dotenv/config");

/**
* Verilen string'i SHA-256 algoritması ile hash'ler.
* String, çevresel değişken olarak tanımlanan bir tuz (salt) ile tuzlanır.
* Yöntem her ne kadar basit olsa da güvenlik açısından önemli bir adım sağlar.
* @param {string} string - Parçalanacak metin.
* @return {string} - SHA-256 ile hash'lenmiş metin.
*/
function saltText(string) {
  const saltCode = process.env.SALT_CODE;
  const reverseSaltCode = saltCode.split("").reverse().join("");
  return saltCode + string + reverseSaltCode;
}

/**
 * SHA-256 algoritması ile verilen string'i hash'ler.
 * @param {string} string 
 * @returns 
 */
function toSHA256(string) {
  const saltedText = saltText(string);
  return crypto.createHash("sha256").update(saltedText).digest("hex");
}

module.exports = toSHA256;
