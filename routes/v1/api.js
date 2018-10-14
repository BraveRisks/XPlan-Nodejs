const express = require('express');

let router = express.Router();
router.post('/translate', (req, res) => {
  let city = req.body.city;
  let road = req.body.road;

  getTranslationText(city, road).then(datas => {
     let result = {
        status: false,
        message: ""
     }
     if (datas['Error']) {
        result.message = datas['Error'];
     } else {
        let cityData = datas[0];
        let roadData = datas[1];
        result.status = true;
        result.message = 'Success';
        result.data = {
           postCode: cityData['postCode'],
           enCity: cityData['enCity'],
           enRoad: roadData['enRoad'] ? roadData['enRoad'] : ""
        }
        //translateLog(`${city}${road}`);
     }
     res.status(200).json(result);
  });
});

async function getTranslationText(zhCity, zhRoad) {
  // 並行處理
  try {
     let [city, road] = await Promise.all([getEnCity(zhCity), getEnRoad(zhRoad)]);
     return [city, road];
  } catch(err) {
     //console.log(`Error：${err}`);
     return err
  }
}

function getEnCity(zhCity) {
  return new Promise((resolve, reject) => {
     PCEnCity.findOne({zhCity: zhCity}, {_id: 0, id: 0, zhCity: 0}, (err, data) => {
        //console.log(`getEnCity：${data}`);
        if (err) reject({Error: err});
        else resolve(data);
     });
  });
}

function getEnRoad(zhRoad) {
  return new Promise((resolve, reject) => {
     PCEnRoad.findOne({zhRoad: zhRoad}, {_id: 0, id: 0, zhRoad: 0}, (err, data) => {
        //console.log(`getEnRoad：${data}`);
        if (err) reject({Error: err});
        else resolve(data ? data : {enRoad: ""});
     });
  });
}

module.exports = router;