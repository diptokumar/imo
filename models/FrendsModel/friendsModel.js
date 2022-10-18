const mongoose = require('mongoose');

const friendsSchema = new mongoose.Schema({
    mainUserID: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    freindId: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    }
},
{
  timestamps: true
});


const friends = mongoose.model('Friends', friendsSchema);

module.exports = friends;
