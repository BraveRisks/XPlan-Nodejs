'use strict'

const AVCore = require('./av-core');
const LIMIT_COUNT = AVCore.LIMIT_COUNT;
const FILMS = AVCore.FILMS;
const NEWS = AVCore.NEWS;
const LOGS = AVCore.LOGS;
const OPTIONS = AVCore.OPTIONS;

// 管理Films News Log資料取得邏輯
class ApiDataManager {
  constructor() {}

  async fetchFilms(category, page, isWeb) {
    try {
      return await Promise.all([
        fetchFilmsDetailWith(category, page, isWeb),
        fetchFilmsDetailWith(category, page, isWeb, true)
      ]);
    } catch (err) {
      AVCore.eventLog('fetchFilms', `category：${category} page：${page}`, err);
      let result = handleError(FILMS.index, err, isWeb);
      return [result, 0];
    }
  }

  async fetchNews(page, isWeb) {
    try {
      return await Promise.all([
        fetchNewsDetailWith(page, isWeb),
        fetchNewsDetailWith(page, isWeb, true)
      ]);
    } catch (err) {
      AVCore.eventLog('fetchNews', `page：${page}`, err);
      let result = handleError(NEWS.index, err, isWeb);
      return [result, 0];
    }
  }

  async fetchLog(page) {
    try {
      return await Promise.all([
        fetchLogDetailWith(page),
        fetchLogDetailWith(page, true)
      ]);
    } catch (err) {
      AVCore.eventLog('fetchLog', `page：${page}`, err);
      let result = handleError(LOGS.index, err, isWeb);
      return [result, 0];
    }
  }

  // 更新瀏覽次數 by _id
  // 筆數自動 +1 http://marklin-blog.logdown.com/posts/1392773
  updateViewCount(type, id) {
    switch (type) {
      case FILMS.type:
        return new Promise((resolve, reject) => {
          Films.findByIdAndUpdate(id, {
            '$inc': {
              'viewCount': 1
            }
          }, {
            new: true
          }, (err, e) => {
            let result = {
              status: err === null,
              message: err ? `UpdateViewCount ${type} ${err}.` : `UpdateViewCount ${type} success.`,
              data: err === null ? e : null
            }
            resolve(result);
          });
        });
      case NEWS.type:
        return new Promise((resolve, reject) => {
          News.findByIdAndUpdate(id, {
            '$inc': {
              'viewCount': 1
            }
          }, {
            new: true
          }, (err, e) => {
            let result = {
              status: err === null,
              message: err ? `UpdateViewCount ${type} ${err}.` : `UpdateViewCount ${type} success.`,
              data: err === null ? e : null
            }
            resolve(result);
          });
        });
    }
  }

  // 更新films or news 資料
  updateData(type, parameters) {
    switch (type) {
      case FILMS.type:
        return new Promise((resolve, reject) => {
          Films.findByIdAndUpdate(parameters.id, {
            '$set': {
              'category': parameters.category,
              'title': parameters.title,
              'date': parameters.date,
              'viewCount': parameters.viewCount
            }
          }, {
            new: true
          }, (err, e) => {
            let result = {
              status: err === null,
              message: err ? `Update ${type} ${err}.` : `Update ${type} success.`,
              data: err === null ? e : null
            }
            resolve(result);
          });
        });
      case NEWS.type:
        return new Promise((resolve, reject) => {
          News.findByIdAndUpdate(parameters.id, {
            '$set': {
              'title': parameters.title,
              'content': parameters.content,
              'date': parameters.date,
              'viewCount': parameters.viewCount
            }
          }, {
            new: true
          }, (err, e) => {
            let result = {
              status: err === null,
              message: err ? `Update ${type} ${err}.` : `Update ${type} success.`,
              data: err === null ? e : null
            }
            resolve(result);
          });
        });
    }
  }

  // 刪除films or news by _id
  async deleteWith(type, id) {
    switch (type) {
      case FILMS.type:
        return new Promise((resolve, reject) => {
          Films.deleteOne({
            _id: id
          }, (err) => {
            let result = {
              status: err === null,
              message: err ? `Delete films ${err}.` : 'Delete films success.',
              data: null
            }
            resolve(result);
          });
        });
      case NEWS.type:
        return new Promise((resolve, reject) => {
          News.deleteOne({
            _id: id
          }, (err) => {
            let result = {
              status: err === null,
              message: err ? `Delete news ${err}.` : 'Delete news success.',
              data: null
            }
            resolve(result);
          });
        });
    }
  }

  // 回饋意見
  sendFeedback(parameters) {
    return new Promise((resolve, reject) => {
      new Feedback({
        ranking: parameters.ranking,
        content: parameters.content,
        recommend: parameters.recommend,
        createDate: AVCore.nowDate()
      }).save((err, e) => {
        let result = {
          status: err === null,
          message: err ? `SendFeedback failed ${err}.` : `SendFeedback success.`
        }
        resolve(result);
      });
    });
  }
}


function fetchFilmsDetailWith(category, page, isWeb, isCount = false) {
  if (isCount) {
    return new Promise((resolve, reject) => {
      Films.countDocuments({
        category: category
      }, (err, count) => {
        if (err) reject(0);
        else resolve(count);
      });
    });
  } else {
    return new Promise((resolve, reject) => {
      let result = {
        status: true,
        message: 'Fetch films data success',
        totalCount: 0,
        pageCount: 0,
        current: {
          category: category,
          page: page
        },
        listCount: 0
      }
      Films.find({
        category: category
      }, OPTIONS, (err, e) => {
        if (err) {
          result.status = false;
          result.message = `Fetch films data error of ${err}`;
          reject(result);
        } else {
          result.listCount = e === null ? 0 : e.length;
          result.list = e;
          resolve(result);
        }
      }).sort({
        'date': -1
      }).limit(LIMIT_COUNT).skip(page * LIMIT_COUNT);
    });
  }
}

function fetchNewsDetailWith(page, isWeb, isCount = false) {
  if (isCount) {
    return new Promise((resolve, reject) => {
      News.countDocuments((err, count) => {
        if (err) reject(0);
        else resolve(count);
      });
    });
  } else {
    return new Promise((resolve, reject) => {
      let result = {
        status: true,
        message: 'Fetch news data success',
        totalCount: 0,
        pageCount: 0,
        current: {
          page: page
        },
        listCount: 0
      }
      News.find({}, OPTIONS, (err, e) => {
        if (err) {
          result.status = false;
          result.message = `Fetch news data error of ${err}`;
          reject(result);
        } else {
          result.listCount = e === null ? 0 : e.length;
          result.list = e;
          resolve(result);
        }
      }).sort({
        'date': -1
      }).limit(LIMIT_COUNT).skip(page * LIMIT_COUNT);
    });
  }
}

function fetchLogDetailWith(page, isCount = false) {
  if (isCount) {
    return new Promise((resolve, reject) => {
      Log.countDocuments((err, count) => {
        if (err) reject(0);
        else resolve(count);
      });
    });
  } else {
    return new Promise((resolve, reject) => {
      let result = {
        status: true,
        message: 'Fecth log data success',
        totalCount: 0,
        pageCount: 0,
        current: {
          page: page
        },
        listCount: 0
      }
      Log.find({}, OPTIONS, (err, e) => {
        if (err) {
          result.status = false;
          result.message = `Fecth log data error of ${err}`;
          reject(result);
        } else {
          result.listCount = e === null ? 0 : e.length;
          result.list = e;
          resolve(result);
        }
      }).sort({
        'createDate': -1
      }).limit(LIMIT_COUNT).skip(page * LIMIT_COUNT);
    });
  }
}

function handleError(index, err, isWeb) {
  let message = type == FILMS.index ? `Fetch films data error of ${err}` :
                type == NEWS.index  ? `Fetch news data error of ${err}`  : `Fetch log data error of ${err}`
  let result = {
    status: false,
    message: message,
    totalCount: 0,
    pageCount: 0,
    current: {
      page: 0
    },
    listCount: 0
  }
  if (isWeb) {
    result.current.start = 0;
    result.current.end = 0;
    result.prevShow = false;
    result.nextShow = false;
  }

  return result;
}

module.exports = ApiDataManager;