const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

// Use for > 4.11.2
let url = 'mongodb://ray:rayboy26@ds141320.mlab.com:41320/heroku_dwlds0bq';
if (DEBUG) {
  url = 'mongodb://127.0.0.1:27017/video';
}
const options = {
  useNewUrlParser: true,
  useCreateIndex: true,
  useFindAndModify: false,
  autoIndex: false, // Don't build indexes
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0,
  connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
};
mongoose.connect(url, {useNewUrlParser: true}).then(
   () => {
      console.log(`DB connection ${url} success.`);
   },
   (err) => {
      console.log('DB connection error:' + err);
   }
);
