const mongoose = require('mongoose');

const friendslogSchema = new mongoose.Schema({
    userOne: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
    },
    userTwo: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    },
    request: {
        type: String,
        enum: ['accept', 'reject','pending'],
    },
    unfriend: {
        type: Boolean,
    },
    unfriendRequestBy: {
        type: mongoose.Types.ObjectId,
        ref: 'User',
        },
    friendRequestBy: {
            type: mongoose.Types.ObjectId,
            ref: 'User',
            }
},
{
  timestamps: true
});


const friends = mongoose.model('Friendlog', friendslogSchema);

module.exports = friends;
