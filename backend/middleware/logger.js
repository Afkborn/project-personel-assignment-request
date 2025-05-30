const getTimeForLog = require("../common/time");

module.exports = (reqID) => (request, _, next) => {
  let clientIP =
    request.headers["x-forwarded-for"] || request.socket.remoteAddress;
  
  const username = request.user ? request.user.registrationNumber : "GUEST";
  if (clientIP === "::1") {
    clientIP = "127.0.0.1";
  }

  const logMessage =
    getTimeForLog() + `Sicil ${username}\t[IP ${clientIP}]\t(${reqID})`;

  console.log(logMessage); // Logları konsola yaz

  next();
};
