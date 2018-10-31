const request = require('request');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const onepondo = '1pondo';
const caribbean = 'caribbeancom';
const heyzo = 'heyzo';
const films = [onepondo, caribbean, heyzo];
const time = 1000;

let intervals = [];
let pages = [1, 1, 1];

// https://www.1pondo.tv/list/?page=1&o=newest
// http://www.heyzo.com/listpages/all_1.html
// https://www.caribbeancom.com/listpages/all1.htm

/**
 * needLoop:是否要Interval
 */
module.exports.getAVList = function (needLoop = false) {
  if (needLoop) {
    intervals.push(setInterval(() => {
      getAVWith1pando(pages[0]);
      pages[0] = pages[0] + 1;
    }, time));
    intervals.push(setInterval(() => {
      getAVWithHeyzo(pages[1]);
      pages[1] = pages[1] + 1;
    }, time * 2));
    intervals.push(setInterval(() => {
      getAVWithCaribbean(pages[2]);
      pages[2] = pages[2] + 1;
    }, time * 3));
  } else {
    getAVWith1pando(1);
    getAVWithHeyzo(1);
    getAVWithCaribbean(1);
  }
}

function getAVWith1pando(page) {
  const url = `https://www.1pondo.tv/list/?page=${page}&o=newest`;
  Utils.log(`URL --> ${DEBUG} ${Utils.dateNow()} ${url}`);
  // Use for test
  if (page > 3) {
    clearInterval(intervals[0]);
    Utils.log(`Cancel Interval`);
    return;
  }

  (async () => {
    try {
      let browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
      });
      if (DEBUG) {
        browser = await puppeteer.launch({
          headless: true
        });
      }
      const page = await browser.newPage();
      await page.goto(url);
      const html = await page.content()
      const $ = cheerio.load(html);
      const list = $('.contents .flex-grid .grid-item');
      //console.log(`list --> ${list.length}`);
      list.each((index, element) => {
        let title = $(element).find('.meta-title').text();
        let date = $(element).find('.meta-data').text().substring(0, 10);
        let htmlURL = $(element).find('a').attr('href');
        let imgURL = $(element).find('img').attr('src');
        //console.log(`title --> ${title} date --> ${date} htmlURL --> ${htmlURL} imgURL --> ${imgURL}`);
      });
      await browser.close();
    } catch (e) {
      console.log(`Error --> ${e}`);
    }
  })();
}

function getAVWithHeyzo(page) {
  const url = `http://www.heyzo.com/listpages/all_${page}.html`;
  Utils.log(`URL --> ${DEBUG} ${Utils.dateNow()} ${url}`);
  // Use for test
  if (page > 3) {
    clearInterval(intervals[1]);
    Utils.log(`Cancel Interval`);
    return;
  }

  (async () => {
    try {
      let browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
      });
      if (DEBUG) {
        browser = await puppeteer.launch({
          headless: true
        });
      }
      const page = await browser.newPage();
      await page.goto(url);
      const html = await page.content()
      const $ = cheerio.load(html);
      const list = $('#list-container #movies .movie');
      //console.log(`list --> ${list.length}`);
      // http://www.heyzo.com
      list.each((index, element) => {
        let title = $(element).find('a .lazy').attr('title');
        let date = $(element).find('p').text();
        let htmlURL = $(element).find('a').attr('href');
        let imgURL = $(element).find('a .lazy').attr('data-original');
        //console.log(`title --> ${title} date --> ${date} htmlURL --> ${htmlURL} imgURL --> http://www.heyzo.com${imgURL}`);
      });
      await browser.close();
    } catch (e) {
      console.log(`Error --> ${e}`);
    }
  })();
}

function getAVWithCaribbean(page) {
  const url = `https://www.caribbeancom.com/listpages/all${page}.htm`;
  Utils.log(`URL --> ${DEBUG} ${Utils.dateNow()} ${url}`);
  // Use for test
  if (page > 3) {
    clearInterval(intervals[2]);
    Utils.log(`Cancel Interval`);
    return;
  }

  (async () => {
    try {
      let browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox']
      });
      if (DEBUG) {
        browser = await puppeteer.launch({
          headless: true
        });
      }
      const page = await browser.newPage();
      await page.goto(url);
      const html = await page.content()
      const $ = cheerio.load(html);
      const list = $('.list .flex-grid .grid-item');
      //console.log(`list --> ${list.length}`);
      list.each((index, element) => {
        let title = $(element).find('img').attr('title');
        let date = $(element).find('.entry-meta .meta-data').text().substring(0, 10);
        let htmlURL = $(element).find('a').attr('href');
        let imgURL = $(element).find('img').attr('src');
        //console.log(`title --> ${title} date --> ${date} htmlURL --> ${htmlURL} imgURL --> ${imgURL}`);
      });
      await browser.close();
    } catch (e) {
      console.log(`Error --> ${e}`);
    }
  })();
}

/**
 * needLoop:是否要Interval
 */
module.exports.getAVList2 = function (needLoop) {
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