const mongoose = require('mongoose');

const supplySchema = new mongoose.Schema({
    seller: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    },
    totalBalance: {
        type: Number,
        default: 0
    },
    
},
{
  timestamps: true
});


const supply = mongoose.model('Supply', supplySchema);

module.exports = supply;
