const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const moment = require('moment');
const orderSchema = new mongoose.Schema({
  
  product: {
    type: mongoose.Types.ObjectId,
    ref: 'Product',
  },
  seller: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  buyerId:{
    type: mongoose.Types.ObjectId,
    ref: 'User',
  },
  orderStatus: {
      type: String,
      enum: ['pending','cancelled', 'completed'],
      default: 'pending'
  },
  orderDate: {
    type: Date,
    default: Date.now()
    
  },
  orderMonth: {
      type: String,
      default: moment().format('MM-YYYY')
      },
  orderPrice: {
        type: Number,
        default: 0
  },
  gameId: {
    type: String,
    // required: true,
  },
  gameName: {
    type: String,
    // required: true,
  },
  gid: {
    type: String,
    // required: true,
  },
  fbmail: {
    type: String,
    // required: true,
  },
  fbpass: {
    type: String,
    // required: true,
  },
  remarks: String



},
{
  timestamps: true
});

orderSchema.plugin(AutoIncrement, { inc_field: 'orderno' });

const order = mongoose.model('Order', orderSchema);

module.exports = order;
