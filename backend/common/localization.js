function changeTurkishCharacters(str) {
  return str
    .replace(/ğ/g, "g")
    .replace(/Ğ/g, "G")
    .replace(/ü/g, "u")
    .replace(/Ü/g, "U")
    .replace(/ş/g, "s")
    .replace(/Ş/g, "S")
    .replace(/ı/g, "i")
    .replace(/İ/g, "I")
    .replace(/ö/g, "o")
    .replace(/Ö/g, "O")
    .replace(/ç/g, "c")
    .replace(/Ç/g, "C")
    .replace(/æ/g, "ae")
    .replace(/ß/g, "ss")
    .replace(/â/g, "a")
    .replace(/ê/g, "e");
}

module.exports = {
  changeTurkishCharacters,
};
