const mongoose = require('mongoose');

const admincutSchema = new mongoose.Schema({
    depositid: {
        type: mongoose.Types.ObjectId,
        ref: 'Deposit',
        },
    seller: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    },
    depositBalance: {
        type: Number,
    },
    admincutamount: Number,
    
},
{
  timestamps: true
});


const admincut = mongoose.model('AdminCut', admincutSchema);

module.exports = admincut;
