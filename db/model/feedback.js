const mongoose = require('mongoose');
let Schema = mongoose.Schema;

// 使用者回饋
let feedbackSchema = new Schema({
  user: {
    type: String,
    default: ''
  },
  ranking: {
    type: Number,
    required: true,
  },
  content: {
    type: String
  },
  recommend: {
    type: Boolean,
    required: true
  },
  createDate: {
    type: String,
    required: true
  }
}, {
  collection: 'feedback'
});

let feedback = mongoose.model('feedback', feedbackSchema);
module.exports = feedback;