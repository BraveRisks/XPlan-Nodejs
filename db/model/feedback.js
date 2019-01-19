const mongoose = require('mongoose');
let Schema = mongoose.Schema;

// 使用者回饋
let feedbackSchema = new Schema({
  ranking: {
    type: number,
    required: true,
  },
  content: {
    type: String
  },
  recommend: {
    type: boolean,
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