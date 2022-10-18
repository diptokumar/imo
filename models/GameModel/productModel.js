const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: [true, 'Please tell us your product name!']
  },
  image: String,
  game: {
      type: mongoose.Types.ObjectId,
      ref: 'Game',
  },
  category: {
      type: mongoose.Types.ObjectId,
      ref: 'Category',
  },
  price: {
      type: Number,
      required: true
  },
  points: {
    type: Number,
    default: 0,
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


const product = mongoose.model('Product', productSchema);

module.exports = product;
