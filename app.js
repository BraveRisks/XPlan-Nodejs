const express = require('express');
const body_parser = require('body-parser');
const logger = require('morgan');
const path = require('path');
const schedule = require('node-schedule');

let app = express();

// jwt srect key
process.env.SECRET_KEY = 'Ray@Zhang_10*S_e_c^r^e_t';

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
app.set('view engine', 'ejs');

// Utils
global.DEBUG = false;
global.Utils = require('./utils/utils');

// Routes
//let api = require('./routes/v1/api');
//app.use('/api', api);
let av = require('./routes/v1/av');

// DB
require('./db/connect');
global.Video = require('./db/model/video');
global.Trigger = require('./db/model/trigger');

// AV List Schedule
// 每天凌晨3點觸發
let rule = new schedule.RecurrenceRule();
rule.dayOfWeek = [new schedule.Range(0, 6)];
rule.hour = 3;
rule.minute = 0;
let avSchedule = schedule.scheduleJob(rule, () => {
  av.getAVList(false);
  new Trigger({
    method: 'AV Schedule',
    createDate: Utils.dateNow()
  }).save();
});

app.set('port', (process.env.PORT || 5000));
app.listen(app.get('port'), function () {
  console.log('XPlan app is running on port', app.get('port'));
  new Trigger({
    method: 'Video getAVList',
    createDate: Utils.dateNow()
  }).save();
  av.getAVList(true);
});