const mongoose = require('mongoose');

const sellerproductSchema = new mongoose.Schema({
  product: {
      type: mongoose.Types.ObjectId,
      ref: 'Product',
  },
  seller: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
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


const sellerproduct = mongoose.model('SellerProduct', sellerproductSchema);

module.exports = sellerproduct;
