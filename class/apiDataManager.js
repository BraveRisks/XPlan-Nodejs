'use strict'

// 每次取得數量
const LIMIT_COUNT = 30;
const FILMS = {
  index: 1,
  type: 'films'
};
const NEWS = {
  index: 2,
  type: 'news'
};
const LOGS = {
  index: 3,
  type: 'news'
};
const OPTIONS = {
  '__v': 0
};

// 管理Films News Trigger資料取得邏輯
class ApiDataManager {
  constructor() {}

  async getFilms(category, page, isFromWeb) {
    try {
      return await Promise.all([
        getFilmsDetailWith(category, page, isFromWeb),
        getFilmsDetailWith(category, page, isFromWeb, true)
      ]);
    } catch (err) {
      saveTrigger(`getFilms category：${category} page：${page}`, err);
      let result = handleError(FILMS.index, err, isFromWeb);
      return [result, 0];
    }
  }

  async getNews(page, isFromWeb) {
    try {
      return await Promise.all([
        getNewsDetailWith(page, isFromWeb),
        getNewsDetailWith(page, isFromWeb, true)
      ]);
    } catch (err) {
      saveTrigger(`getNews page：${page}`, err);
      let result = handleError(NEWS.index, err, isFromWeb);
      return [result, 0];
    }
  }

  async getLogs(page) {
    try {
      return await Promise.all([
        getLogDetailWith(page),
        getLogDetailWith(page, true)
      ]);
    } catch (err) {
      saveTrigger(`getLogs page：${page}`, err);
      let result = handleError(LOGS.index, err, isFromWeb);
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
  async deleteFilms(type, id) {
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
}

function getFilmsDetailWith(category, page, isFromWeb, isCount = false) {
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
        message: 'Get films data success',
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
          result.message = `Get films data error of ${err}`;
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

function getNewsDetailWith(page, isFromWeb, isCount = false) {
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
        message: 'Get news data success',
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
          result.message = `Get news data error of ${err}`;
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

function getLogDetailWith(page, isCount = false) {
  if (isCount) {
    return new Promise((resolve, reject) => {
      Trigger.countDocuments((err, count) => {
        if (err) reject(0);
        else resolve(count);
      });
    });
  } else {
    return new Promise((resolve, reject) => {
      let result = {
        status: true,
        message: 'Get log data success',
        totalCount: 0,
        pageCount: 0,
        current: {
          page: page
        },
        listCount: 0
      }
      Trigger.find({}, OPTIONS, (err, e) => {
        if (err) {
          result.status = false;
          result.message = `Get log data error of ${err}`;
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

function saveTrigger(method, msg = null) {
  new Trigger({
    method: method,
    message: msg,
    isError: msg !== null,
    createDate: Utils.dateNow()
  }).save();
}

function handleError(index, err, isFromWeb) {
  let message = type == FILMS.index ? `Get films data error of ${err}` :
    type == NEWS.index ? `Get news data error of ${err}` : `Get log data error of ${err}`
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
  if (isFromWeb) {
    result.current.start = 0;
    result.current.end = 0;
    result.prevShow = false;
    result.nextShow = false;
  }

  return result;
}

module.exports = ApiDataManager;
module.exports.LIMIT_COUNT = LIMIT_COUNT;