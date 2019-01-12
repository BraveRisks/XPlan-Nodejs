'use strict'

// 1.
// https://firebase.google.com/docs/cloud-messaging/admin/send-messages
// 使用 firebase-admin 來發送推播
const admin = require('firebase-admin');
var serviceAccount = require('../resource/sinyi-ta-app-firebase-adminsdk.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://sinyi-ta-app.firebaseio.com'
});

// 手機註冊Token
let registrationToken = 'cpLyete_LcY:APA91bEDGDNqpF20tBTdk_SqC-OKzkkacY7OfaDkzMfxBDCGctm-Pyt-6s8PcNdN7VmsNA8dqLYzadhvyFQaEgvcsUm8z9wQUPSjv1W0yg0O4lD1eJ0-OHIUoSVcH9GKxK-MT92Z-Pbf';
let message = {
  // 共用區
  notification: {
    title: 'FCM Notification send message',
    body: 'Welcome to use fcm server.',
  },
  // 額外添加資訊
  data: {
    category: 'Car',
    content: '【解除封印】Google Android Auto正式開放下載，實際操作使用分享！'
  },
  android: {
    ttl: 3600 * 1000,
    notification: {
      // 如果設置了會覆蓋上面的title
      title: "FCM Notification",
      // 如果設置了會覆蓋上面的body
      body: 'Welcome to use.',
      // icon：告訴android使用的icon，如果android找不到則會用預設的icon
      icon: 'stock_ticker_update',
      // color：告訴android渲染的顏色
      color: '#3333cc'
    }
  },
  apns: {
    headers: {
      'apns-priority': '10'
    },
    payload: {
      aps: {
        alert: {
          title: "FCM Notification",
          body: 'Welcome to use.'
        },
        data: {
          category: 'Car',
          content: '【解除封印】Google Android Auto正式開放下載，實際操作使用分享！'
        },
        category: 'AppUpdate',
        sound: 'song',
        badge: 1,
      }
    }
  },
  token: registrationToken
};

// Send a message in the dry run mode.
let dryRun = false;
module.exports.send = function () {
  admin.messaging().send(message, dryRun)
    .then((res) => {
      console.log(`Successfully sent message --> ${res}`);
    })
    .catch((error) => {
      console.log(`Error sending message --> ${error}`);
    });
}


// 2.
// Send multi devices
// 傳送多部Device，每次傳送上限為1000部
// https://firebase.google.com/docs/cloud-messaging/admin/legacy-fcm
let multiTokens = [registrationToken];
let messages = {
  // 共用區
  notification: {
    title: "FCM Notification",
    body: 'Welcome to use. (Multi)'
  },
  // 額外添加資訊
  data: {
    category: 'Car',
    content: '【解除封印】Google Android Auto正式開放下載，實際操作使用分享！'
  }
};
let options = {
  priority: 'high',
  timeToLive: 60 * 60 * 24
};
module.exports.sendMultiDevices = function () {
  admin.messaging().sendToDevice(multiTokens, messages, options)
    .then(function (res) {
      console.log(`Successfully sent message(multi) --> ${JSON.stringify(res)}`);
    })
    .catch(function (error) {
      console.log(`Error sending message(multi) --> ${error}`);
    });
}

// 3.
// 透過請求至FCM指定的Server
// https://firebase.google.com/docs/cloud-messaging/http-server-ref
const http = require("http");
// FCM notification server
const firebaseURL = 'fcm.googleapis.com';
// 伺服器金鑰
const serverKey = 'AAAARbw7FJM:APA91bGJRkf6vQSGFHi1bf6kl7YkFYMjxq1mRMjHz1QYcEoRvJBjs_yvboAeBqO_YnV_nk0wlmBOENwKZGo6li1QHcSLFqhTvy85mXeXgLA9GkmSulSRJ9YA6YBxNpBEKtb_d4H4X9UT';
let option = {
  host: firebaseURL,
  path: '/fcm/send',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `key=${serverKey}`
  }
};
// 傳送請求內容
let requestBody = JSON.stringify({
  registration_ids: [registrationToken],
  notification: {
    title: "FCM Notification",
    body: 'Welcome to use. (FCM Server)'
  },
  data: {
    category: 'Car',
    content: '【解除封印】Google Android Auto正式開放下載，實際操作使用分享！'
  },
  priority: 'high'
});

module.exports.sendUseServer = function () {
  let req = http.request(option, (res) => {
    res.setEncoding('utf8');

    let responseString = "";
    res.on('data', (data) => {
      responseString += data;
    });
    res.on('end', () => {
      console.log(`Response (FCM Server) --> ${responseString}`);
    });
  });

  req.on('error', (error) => {
    console.log(`Error (FCM Server) --> ${error}`);
  });
  req.write(requestBody);
  req.end();
}