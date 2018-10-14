module.exports.dateNow = function () {
  // options : https://developer.mozilla.org/zh-TW/docs/Web/JavaScript/Reference/Global_Objects/Date/toLocaleString
  let options = {
    timeZone: 'Asia/Taipei',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }
  return new Date().toLocaleString('zh-TW', options);
};

module.exports.log = (msg) => {
  if (DEBUG) {
    console.log(msg);
  }
};