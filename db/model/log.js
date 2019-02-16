const mongoose = require('mongoose');
let Schema = mongoose.Schema;

// 紀錄
let logSchema = new Schema({
  method: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    default: ''
  },
  errorMsg: {
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
}, {collection: 'log'});

module.exports = mongoose.model('log', logSchema);