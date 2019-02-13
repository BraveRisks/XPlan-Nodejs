'use strict'

const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_13_2) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/71.0.3578.98 Safari/537.36';
const onepondo = '1pondo';
const heyzo = 'heyzo';
const caribbean = 'caribbeancom';
const scute = 's-cute'
const filmsNames = [onepondo, heyzo, caribbean, scute];
const dueYear = 2017;
const time = 8000;

let intervals = [];
let pages = [1, 1, 1, 1];
let newsInterval;
let newsPage = 1;

// https://www.1pondo.tv/list/?page=1&o=newest
// http://www.heyzo.com/listpages/all_1.html
// https://www.caribbeancom.com/listpages/all1.htm
// http://www.s-cute.com/contents/?&page=1

class AVDataManager {
  constructor() {}

  /**
   * needLoop:是否要Interval
   * page:指定抓取的頁數
   */
  getAVFilms(needLoop = false, page = 1) {
    saveTrigger(`Start getAVFilms`);
    if (needLoop) {
      process.setMaxListeners(Infinity);
    }
    for (let i = 0; i < filmsNames.length; i++) {
      if (needLoop) {
        intervals.push(setInterval(() => {
          getAVFilmsWith(filmsNames[i], pages[i]);
          pages[i] = pages[i] + 1;
        }, time + 5000 * i));
      } else {
        getAVFilmsWith(filmsNames[i], page);
      }
    }
  }

  getAVNews(needLoop = false, page = 1) {
    saveTrigger(`Start getAVNews`);
    if (needLoop) {
      newsInterval = setInterval(() => {
        getAVNewsWith(newsPage);
        newsPage += 1;
      }, time - 3000);
    } else {
      getAVNewsWith(page);
    }
  }
}

function getAVFilmsWith(films, page) {
  let type =
    films == onepondo ? 0 :
    films == heyzo ? 1 :
    films == caribbean ? 2 : 3;
  let url = `https://www.1pondo.tv/list/?page=${page}&o=newest`;
  if (type == 1) {
    url = `http://www.heyzo.com/listpages/all_${page}.html`;
  } else if (type == 2) {
    url = `https://www.caribbeancom.com/listpages/all${page}.htm`;
  } else if (type == 3) {
    url = `http://www.s-cute.com/contents/?&page=${page}`;
  }
  Utils.log(`URL --> ${Utils.dateNow()} ${url}`);
  // Use for test
  // if (page > 1 && DEBUG) {
  //   clearInterval(intervals[type]);
  //   Utils.log(`Cancel Interval on URL ${url}`);
  //   return;
  // }

  (async () => {
    try {
      let browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      if (DEBUG) {
        browser = await puppeteer.launch();
      }
      
      // https://www.kabanoki.net/2473
      const page = await browser.newPage();
      await page.setUserAgent(userAgent);
      await page.goto(url, {waitUntil: 'load', timeout: 0});
      if (films == onepondo) {
        await page.waitForSelector('li.pagination-next > a');
      }

      const html = await page.content();
      const $ = cheerio.load(html);

      let datas = [];
      if (type == 0) {
        const list = $('.contents .flex-grid .grid-item');
        //console.log(`list --> ${list.length}`);
        list.each((index, element) => {
          let title = $(element).find('.meta-title').text();
          let date = $(element).find('.meta-data').text().substring(0, 10);
          let htmlURL = `https://www.1pondo.tv${$(element).find('a').attr('href')}`;
          let imgURL = `https://www.1pondo.tv${$(element).find('img').attr('src')}`;
          //Utils.log(`title --> ${title} date --> ${date} htmlURL --> ${htmlURL} imgURL --> ${imgURL}`);
          stopIntervalAndPushData(datas, type, films, title, date, htmlURL, imgURL);
        });
      } else if (type == 1) {
        const list = $('#list-container #movies .movie');
        //console.log(`list --> ${list.length}`);
        list.each((index, element) => {
          let title = $(element).find('a .lazy').attr('title');
          let date = $(element).find('p').text().replace(new RegExp('公開日: ', 'g'), '');
          let htmlURL = `http://www.heyzo.com${$(element).find('a').attr('href')}`;
          let imgURL = `http://www.heyzo.com${$(element).find('a .lazy').attr('data-original')}`;
          //Utils.log(`title --> ${title} date --> ${date} htmlURL --> ${htmlURL} imgURL --> ${imgURL}`);
          stopIntervalAndPushData(datas, type, films, title, date, htmlURL, imgURL);
        });
      } else if (type == 2) {
        const list = $('.list .flex-grid .grid-item');
        //console.log(`list --> ${list.length}`);
        list.each((index, element) => {
          let title = $(element).find('img').attr('title');
          let date = $(element).find('.entry-meta .meta-data').text().substring(0, 10);
          let htmlURL = `https://www.caribbeancom.com${$(element).find('a').attr('href')}`;;
          let imgURL = $(element).find('img').attr('src');
          //Utils.log(`title --> ${title} date --> ${date} htmlURL --> ${htmlURL} imgURL --> ${imgURL}`);
          stopIntervalAndPushData(datas, type, films, title, date, htmlURL, imgURL);
        });
      } else {
        // col-lg-4：前面3個 ; col-lg-3：後面28個
        const listOf4 = $('.container .row .col-lg-9.col-md-8.col-sm-8 .row .col-lg-4');
        const listOf3 = $('.container .row .col-lg-9.col-md-8.col-sm-8 .row .col-lg-3');
        //console.log(`listOf3 --> ${listOf3.length} ; listOf4 --> ${listOf4.length}`);
        listOf4.each((index, element) => {
          let title = $(element).find('.contents-title a').text();
          let date = $(element).find('.meta span').text().substring(0, 10);
          let htmlURL = $(element).find('a').attr('href');
          let imgURL = $(element).find('img').attr('src');
          //Utils.log(`listOf4 title --> ${title} date --> ${date} htmlURL --> ${htmlURL} imgURL --> ${imgURL}`);
          stopIntervalAndPushData(datas, type, films, title, date, htmlURL, imgURL);
        });
        listOf3.each((index, element) => {
          let title = $(element).find('.contents-title a').text();
          let date = $(element).find('.meta span').text().substring(0, 10);
          let htmlURL = $(element).find('a').attr('href');
          let imgURL = $(element).find('img').attr('src');
          //Utils.log(`listOf3 title --> ${title} date --> ${date} htmlURL --> ${htmlURL} imgURL --> ${imgURL}`);
          stopIntervalAndPushData(datas, type, films, title, date, htmlURL, imgURL);
        });
        
      }
      // 儲存資料
      saveAVFilms(datas);

      await page.close();
      await browser.close();
    } catch (err) {
      saveTrigger(`getAVFilmsWithURL\n${url}`, err);
      Utils.log(`getAVFilmsWithURL - ${url} Error --> ${err}`);
    }
  })();
}

function getAVNewsWith(page) {
  const url = `https://www.hilive.tv/news/list/p${page}`;
  Utils.log(`getAVNews URL --> ${Utils.dateNow()} ${url}`);
  (async () => {
    try {
      let browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      if (DEBUG) {
        browser = await puppeteer.launch({
          headless: true
        });
      }

      const page = await browser.newPage();
      await page.setUserAgent(userAgent);
      await page.goto(url);
      // 第一次進入會顯示警示資訊畫面，需點擊進入按鈕
      await page.waitForSelector('.pull-right .btn');
      let btnEnter = await page.$('.pull-right .btn');
      await btnEnter.click();
      await page.waitForNavigation();

      const html = await page.content();
      await page.waitFor(100);
      const $ = cheerio.load(html);

      let datas = [];
      const list = $('#all #content .container #blog-listing .col-sm-12');
      //Utils.log(`list --> ${list.length}`);
      list.each((index, element) => {
        let title = $(element).find('.col-sm-8 h3 a').text();
        let content = $(element).find('.col-sm-8 .intro').text();
        let date = $(element).find('.col-sm-8 .date-comments a').text().substring(0, 10);
        let htmlURL = $(element).find('.col-sm-8 h3 a').attr('href');
        let imgURL = $(element).find('img').attr('src');
        //Utils.log(`title --> ${title} content --> ${content} date --> ${date} htmlURL --> ${htmlURL} imgURL --> ${imgURL}`);
        if (parseInt(date.split('-')[0]) == dueYear) {
          clearInterval(newsInterval);
          Utils.log(`clearInterval ${title} --> ${htmlURL}`);
          return false;
        }

        datas.push({
          title: title,
          content: content,
          date: date,
          htmlURL: `https://www.hilive.tv${htmlURL}`,
          imgURL: imgURL
        });
      });
      // 儲存資料
      for (let i = 0; i < datas.length; i++) {
        News.findOne({
          title: datas[i].title,
          date: datas[i].date
        }, (err, e) => {
          if (err) {
            saveTrigger(`saveAVNewsWith - ${datas[i].title}`, err);
          } else if (e === null) {
            new News({
              title: datas[i].title,
              content: datas[i].content,
              date: datas[i].date,
              htmlURL: datas[i].htmlURL,
              imgURL: datas[i].imgURL,
              createDate: Utils.dateNow()
            }).save();
          }
        });
      }

      await page.close();
      await browser.close();
    } catch (err) {
      saveTrigger(`getAVNewsWithURL\n${url}`, err);
      Utils.log(`getAVNewsWithURL - ${url} Error --> ${err}`);
    }
  })();
}

function stopIntervalAndPushData(datas, type, films, title, date, htmlURL, imgURL) {
  if (parseInt(date.split('-')[0]) == dueYear) {
    clearInterval(intervals[type]);
    // 如果是s-cute，就將MaxListeners回復至預設值
    if (type == 3) {
      process.setMaxListeners(10);
    }
    Utils.log(`clearInterval ${films} --> ${htmlURL}`);
    return false;
  }
  datas.push({
    category: films,
    title: title,
    date: date,
    htmlURL: htmlURL,
    imgURL: imgURL,
    createDate: Utils.dateNow()
  });
}

function saveAVFilms(datas) {
  for (let i = 0; i < datas.length; i++) {
    Films.findOne({
      category: datas[i].category,
      title: datas[i].title,
      date: datas[i].date
    }, (err, e) => {
      if (err) {
        saveTrigger(`saveAVFilmsWith - ${datas[i].category} ${datas[i].title}`, err);
      } else if (e == null) {
        new Films({
          category: datas[i].category,
          title: datas[i].title,
          date: datas[i].date,
          htmlURL: datas[i].htmlURL,
          imgURL: datas[i].imgURL,
          createDate: Utils.dateNow()
        }).save();
      }
    });
  }
}

function saveTrigger(method, msg = null) {
  new Trigger({
    method: method,
    message: msg,
    isError: msg !== null,
    createDate: Utils.dateNow()
  }).save();
}

module.exports = AVDataManager;