const mongoose = require('mongoose');
let Schema = mongoose.Schema;

// 片源資訊
let filmsSchema = new Schema({
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
  },
  viewCount: {
    type: Number,
    default: 0
  }
}, {
  collection: 'films'
});

let films = mongoose.model('films', filmsSchema);
module.exports = films;