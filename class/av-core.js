'use strict'

module.exports.DEBUG = false;

/**
 * 每次抓取資料的數量大小
 */
module.exports.LIMIT_COUNT = 30;

module.exports.FILMS = {
  index: 1,
  type: 'films'
};

module.exports.NEWS = {
  index: 2,
  type: 'news'
};

module.exports.LOG = {
  index: 3,
  type: 'log'
};

/**
 * DB 抓取資料時要忽略的欄位
 */
module.exports.OPTIONS = {
  '__v': 0
};

module.exports.JWT_SECRET_KEY = 'Ray@Zhang_10*S_e_c^r^e_t';

// 紀錄Log
const Log = require('../db/model/log');
module.exports.eventLog = function (method, message = '', errorMsg = null) {
  new Log({
    method: method,
    message: message,
    errorMsg: errorMsg,
    isError: errorMsg !== null,
    createDate: nowDate()
  }).save();
};

// 取得目前時間
module.exports.nowDate = nowDate();
function nowDate () {
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