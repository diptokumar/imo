const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
    categoryName: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  gameId: {
    type: mongoose.Types.ObjectId,
    ref: 'Game',
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  }
},
{
  timestamps: true
});


const category = mongoose.model('Category', categorySchema);

module.exports = category;
