const mongoose = require('mongoose');
let Schema = mongoose.Schema;

// 片源資訊
let newsSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  date: {
    type: String,
    required: true
  },
  htmlURL: {
    type: String,
    required: true
  },
  imgURL: {
    type: String,
    required: true
  },
  createDate: {
    type: String,
    required: true
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  collection: 'news'
});

module.exports = mongoose.model('news', newsSchema);