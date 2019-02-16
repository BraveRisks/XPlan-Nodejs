'use strict'

const express = require('express');
const body_parser = require('body-parser');
const logger = require('morgan');
const path = require('path');
const schedule = require('node-schedule');
const AVDataManager = require('./class/avdata-manager');
const AVCore = require('./class/av-core');

let app = express();
let avDataManager = new AVDataManager();

process.on('unhandledRejection', (reason, promise) => {
  log(`Unhandled Rejection stack at:${reason.stack}`);
  log(`Unhandled Rejection reason at:${reason}`);
  // Recommended: send the information to sentry.io
  // or whatever crash reporting service you use
});

// Use body-parser
app.use(body_parser.json());
// true : 在bodyParser處理Query String
app.use(body_parser.urlencoded({
  extended: false
}));

// Use logger
app.use(logger('dev'));

// static folder
app.use(express.static(path.join(__dirname, '/public')));

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'html');
app.engine('html', require('ejs').__express);

// system print log
global.log = (message) => {
  if (AVCore.DEBUG) console.log(message);
}

// Routes & Api
let api = require('./routes/api');
app.use(['/', '/login', '/v1', '/privacy'], api);

// DB
require('./db/connect');
global.Films = require('./db/model/films');
global.News = require('./db/model/news');
global.Log = require('./db/model/log');
global.Feedback = require('./db/model/feedback');

// AV List Schedule
// 每天凌晨2點觸發
/*let rule = new schedule.RecurrenceRule();
//rule.dayOfWeek = [new schedule.Range(0, 6)];
//rule.hour = 2;
rule.minute = 30;
let avSchedule = schedule.scheduleJob(rule, () => {
  avDataManager.getAVFilms(false);
  avDataManager.getAVNews(false);
  new Trigger({
    method: 'Start AV Schedule',
    createDate: Utils.dateNow()
  }).save();
});*/

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function () {
  log('XPlan app is running on port', app.get('port'));
  //avDataManager.fetchAVFilms(true);
  //avDataManager.fetchAVNews(true);
  avDataManager.fetchAVFilms(false);
  avDataManager.fetchAVNews(false);
});