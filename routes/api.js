'use strict';

const express = require('express');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const ApiDataManager = require('../class/api-manager');
const AVCore = require('../class/av-core');

const LIMIT_COUNT = AVCore.LIMIT_COUNT;
const SHOW_COUNT = 5;

let router = express.Router();
let apiDataManager = new ApiDataManager;

// 首頁
router.get('/', (req, res) => {
  res.redirect('/login')
});

// 登入
router.get('/login', (req, res) => {
  res.render('login', {
    title: 'Login'
  });
});

// 登入(保留中)
router.post('/v1/profile/login', (req, res) => {
  let user = req.body.user;
  let pass = req.body.pass;

  if (user != 'Ray' || pass != 'zxcv2345') {
    res.status(200).json({
      status: false,
      message: 'Login failed. Maybe username or password error.'
    });
    return;
  }

  let token = jwt.sign({
    // exp：token失效時間1天過後
    // iat：token發證時間
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24,
    iat: Math.floor(Date.now() / 1000),
    iss: "Ray",
    data: {
      user: user,
      pass: encryptBySHA256(pass)
    }
  }, AVCore.JWT_SECRET_KEY);

  res.status(200).json({
    status: true,
    message: 'Login success.',
    token: token,
    data: {
      name: 'Ray',
      age: 29,
      gender: 'Male',
      mail: 'ray00178@gmail.com',
      interest: ['sport', 'travel', 'cooding']
    }
  });
});

// 搜尋
router.get('/v1/:type/search', (req, res) => {
  let type = req.params.type;
  let category = req.query.category;
  let page = req.query.page - 1;
  let platform = req.query.platform;
  let isWeb = (typeof platform === 'undefined');
  log(`${platform} fetch data --> ${type} ${category} ${page}`);
  
  switch (type) {
    case AVCore.FILMS.type:
      apiDataManager.fetchFilms(category, page, isWeb)
        .then(datas => {
          handleResult(res, datas, type, page, isWeb, category);
        })
        .catch(err => {
          log(`FetchFilms Error --> ${String(err)}`);
        });
      break
    case AVCore.NEWS.type:
      apiDataManager.fetchNews(page, isWeb)
        .then(datas => {
          handleResult(res, datas, type, page, isWeb);
        }).catch(err => {
          log(`FetchNews Error --> ${String(err)}`);
        });
      break
    case AVCore.LOG.type:
      apiDataManager.fetchLog(page)
        .then(datas => {
          handleResult(res, datas, type, page, isWeb);
        })
        .catch(err => {
          log(`FetchLog Error --> ${String(err)}`);
        });
      break
  }
});

// 更新瀏覽次數
router.put('/v1/:type/update/:id', (req, res) => {
  let type = req.params.type;
  let id = req.params.id;
  apiDataManager.updateViewCount(type, id)
    .then(datas => {
      res.status(200).json(datas);
    });
});

// 刪除films or news data
router.delete('/v1/:type/delete/:id', (req, res) => {
  let type = req.params.type;
  let id = req.params.id;
  apiDataManager.deleteWith(type, id)
    .then(datas => {
      res.status(200).json(datas);
    });
});

// 取得編輯films or news data
router.get('/v1/:type/edit/:id', (req, res) => {
  let type = req.params.type;
  let id = req.params.id;

  switch (type) {
    case AVCore.FILMS.type:
      Films.findById(id, '-__v', (err, e) => {
        res.render('edit', {
          title: `編輯 - ${e.title}`,
          type: type,
          data: e
        });
      });
      break;
    case AVCore.NEWS.type:
      News.findById(id, '-__v', (err, e) => {
        res.render('edit', {
          title: `編輯 - ${e.title}`,
          type: type,
          data: e
        });
      });
      break
  }
});

// 更新films or news data
router.post('/v1/:type/update/:id', (req, res) => {
  let type = req.params.type;
  let id = req.params.id;
  let parameters = {
    id: id,
    category: req.body.category,
    title: req.body.title,
    content: req.body.content,
    date: req.body.date,
    viewCount: req.body.viewCount === '' ? 0 : parseInt(req.body.viewCount)
  }
  apiDataManager.updateData(type, parameters)
    .then(datas => {
      res.status(200).json(datas);
    });
});

// 意見回饋
router.post('/v1/feedback', (req, res) => {
  let parameters = {
    ranking: req.body.ranking,
    content: req.body.content,
    recommend: req.body.recommend
  }
  apiDataManager.sendFeedback(parameters)
    .then(datas => {
      res.status(200).json(datas);
    });
});

// Privacy - 隱私權政策
router.get('/privacy', (req, res) => {
  res.render('privacy');
});

// Terms - 服務條款
router.get('/terms', (req, res) => {
  res.render('terms');
});

function handleResult(res, datas, type, page, isWeb, category = '') {
  let totalCount = datas[1];
  // 計算分頁數量
  let pageCount = parseInt((totalCount / LIMIT_COUNT));
  pageCount = totalCount % LIMIT_COUNT != 0 ? pageCount + 1 : pageCount;
  datas[0].totalCount = totalCount;
  datas[0].pageCount = pageCount;

  if (category != '') {
    datas[0].current.category = category;
  }

  if (isWeb) {
    datas[0].current.page = page;

    // 一次顯示多少頁數
    let showCount = pageCount >= SHOW_COUNT ? SHOW_COUNT : pageCount;
    // 中間值
    let midCount = parseInt(showCount / 2);
    // 一次顯示7頁，計算起使及結束頁
    let start = page - midCount < 0 ? 0 : page - midCount;
    let end = start + showCount;
    // 如果目前的頁數已無更多頁數，則起始結束頁需重新計算
    if (page >= pageCount - midCount) {
      start = pageCount - showCount;
      end = pageCount;
    }
    datas[0].current.start = start;
    datas[0].current.end = end;
    datas[0].prevShow = page > 0;
    datas[0].nextShow = page < (pageCount - 1);

    res.render(type, {
      title: type == 'films' ? 'AVs - 影片資訊' : type == 'news' ? 'AVs - 情報' : 'AVs - Log紀錄',
      data: datas[0]
    });
  } else {
    datas[0].current.page = page + 1;
    res.status(200).json(datas[0]);
  }
}

function ensureToken(req, res, next) {
  let platform = req.query.platform;
  // 目前先把mobile部分先開放
  if (platform === 'mobile') {
    next()
    return;
  }

  let token = req.body.token || req.query.token || req.headers['token'];
  if (token !== undefined) {
    jwt.verify(token, AVCore.SECRET_KEY, (err, decode) => {
      if (err) {
        res.status(403).json({
          status: false,
          message: 'Forbidden(被禁止)',
          error: err
        });
      } else {
        next();
      }
    });
    // get the decoded payload and header
    let decoded = jwt.decode(token, {
      complete: true
    });
    console.log(decoded.header);
    console.log(decoded.payload);
  } else {
    res.status(403).json({
      status: false,
      message: 'Must be have token.'
    });
  }
}

function encryptBySHA256(pass) {
  let sha256 = crypto.createHash('sha256', AVCore.JWT_SECRET_KEY);
  return sha256.update(pass).digest('hex');
}

module.exports = router;