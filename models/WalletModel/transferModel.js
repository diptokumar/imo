const mongoose = require('mongoose');

const transferSchema = new mongoose.Schema({
    transferfrom: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    },
    transferto: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        },
    transferamount: {
        type: Number,
        default: 0
    },
    message: {
        type: String,
    },
},
{
  timestamps: true
});


const transfer = mongoose.model('Transfer', transferSchema);

module.exports = transfer;
