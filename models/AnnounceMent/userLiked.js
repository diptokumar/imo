const mongoose = require('mongoose');

const userLikedSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Types.ObjectId,
        ref: 'User'
    },
    likedDocuments: {
        type: mongoose.Types.ObjectId,
        ref: 'Announcement'
    }
},
{
    timestamps: true
}
);


const userLiked = mongoose.model('userLike', userLikedSchema);

module.exports = userLiked;
