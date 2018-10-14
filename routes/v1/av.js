const request = require('request');
const cheerio = require('cheerio');

const onepondo = '1pondo';
const caribbean = 'caribbeancom';
const heyzo = 'heyzo';
const films = [onepondo, caribbean, heyzo];
const time = 1000;

let intervals = [];
let pages = [1, 1, 1];

/**
 * needLoop:是否要Interval
 */
module.exports.getAVList = function (needLoop) {
  for (let i = 0; i < films.length; i++) {
    if (needLoop) {
      intervals.push(setInterval(() => {
        getAVWith(films[i], pages[i]);
        pages[i] = pages[i] + 1;
      }, time + 1000 * i));
    } else {
      getAVWith(films[i], pages[i]);
    }
  }
}

function getAVWith(film, page) {
  let type = film == onepondo ? 0 : film == caribbean ? 1 : 2;
  let url = `http://ivtorrent.com/${film}/page/${page}/`;
  Utils.log(`URL --> ${DEBUG} ${Utils.dateNow()} ${url}`);

  // Use for test
  if (page > 3 && DEBUG) {
    clearInterval(intervals[type]);
    Utils.log(`Cancel --> ${type}`);
    return;
  }

  request(url, (err, response, body) => {
    if (err) {
      saveTrigger(`getAVWith - ${film}(${page})`, err);
      return;
    }

    const $ = cheerio.load(body);
    $('.video-list .video-info').each(function (index, element) {
      let title = $(this).find('.text-area').text();
      let date = $(this).find('p').text();
      let htmlURL = $(this).find('a').attr('href');
      let imgURL = $(this).find('img').attr('src');

      // 如果為2017年以前就不儲存
      // for each不能使用break & continue，只能用return false來跳該次
      if (date.split('-')[0] == '2017') {
        clearInterval(intervals[type]);
        return false;
      }
      // 檢查資料庫是否有該筆資訊，如果沒有就儲存
      Video.findOne({
        title: title,
        date: date
      }, (err, v) => {
        if (err) {
          saveTrigger(`Video FindOne - ${film}(${page})`, err);
          return false;
        }
        if (v === null) {
          new Video({
            'category': type,
            'title': title,
            'date': date,
            'htmlURL': htmlURL,
            'imgURL': imgURL,
            'createDate': Utils.dateNow()
          }).save((err, v) => {
            if (err) {
              saveTrigger(`Video Save - ${title}`, err);
            }
            //Utils.log(`Result --> ${JSON.stringify(v)} Error --> ${err}`);
          });
        }
      });
    });
  });
}

function saveTrigger(method, errMsg) {
  new Trigger({
    method: method,
    createDate: Utils.dateNow(),
    errorMsg: errMsg,
    isError: errMsg === null
  }).save();
}