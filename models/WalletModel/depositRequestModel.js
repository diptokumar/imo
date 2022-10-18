const mongoose = require('mongoose');

const depositSchema = new mongoose.Schema({
    seller: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        },
    sellerphoneNumber: {
            type: String,
            required: true
        },
    depositor: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    },
    depositorphoneNumber: {
        type: String,
        required: true
    },
    depositBalance: {
        type: Number,
        default: 0
    },
    transactionId: String,
    paymentType: String,
    paymentStatus: {
        type: String,
        enum: ['pending', 'accept', 'reject'],
        default: 'pending'
    },
    paymentAcceptBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    admincutstatus: {
        type: Boolean,
        default: false
    },
    admincutamount: {
        type: Number,
        default: 0
    }

},
{
  timestamps: true
});


const deposit = mongoose.model('Deposit', depositSchema);

module.exports = deposit;
