const mongoose = require('mongoose');
let Schema = mongoose.Schema;

// 觸發紀錄
let triggerSchema = new Schema({
  method: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    default: ''
  },
  isError: {
    type: Boolean,
    default: false
  },
  createDate: {
    type: String,
    required: true
  }
}, {collection: 'triggers'});

module.exports = mongoose.model('triggers', triggerSchema);