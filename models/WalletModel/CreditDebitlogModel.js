const mongoose = require('mongoose');

const creditdebitlogSchema = new mongoose.Schema({
    wallet: {
    type: mongoose.Types.ObjectId,
    ref: 'Wallet',
    },
    method: {
        type: String,
        enum: ['credit', 'debit'],
        required: true
    },
    amount: Number,
},
{
  timestamps: true
});


const creditdebitlog = mongoose.model('Creditdebitlog', creditdebitlogSchema);

module.exports = creditdebitlog;
