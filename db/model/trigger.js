const mongoose = require('mongoose');
let Schema = mongoose.Schema;

// 觸發紀錄
let triggerSchema = new Schema({
  method: {
    type: String,
    required: true,
  },
  createDate: {
    type: String,
    required: true
  },
  errorMsg: {
    type: String,
    default: ''
  },
  isError: {
    type: Boolean,
    default: false
  }
}, {collection: 'triggers'});

let Trigger = module.exports = mongoose.model('triggers', triggerSchema);