/**
 * 
 * @returns {string} - Güncel zamanı saat:dakika:saniye:milisaniye formatında döner.
 */
function getTimeForLog() {
    const date = new Date();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    const milliseconds = date.getMilliseconds();
    return `${hours}:${minutes}:${seconds}:${milliseconds}\t| `;
  }
  
  module.exports = getTimeForLog;
  