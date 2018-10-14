const mongoose = require('mongoose');
let Schema = mongoose.Schema;

// 片源資訊
let videoSchema = new Schema({
  category: {
    type: String,
    required: true,
  },
  title: {
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
  }
}, {
  collection: 'videos'
});

let Video = module.exports = mongoose.model('videos', videoSchema);