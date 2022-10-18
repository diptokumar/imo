const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
    walletUser: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    },
    credit: {
        type: Number,
        default: 0
    },
    currentbalance: {
        type: Number,
        default: 0
    },
    debit: {
        type: Number,
        default: 0
    },
},
{
  timestamps: true
});


const wallet = mongoose.model('Wallet', walletSchema);

module.exports = wallet;
