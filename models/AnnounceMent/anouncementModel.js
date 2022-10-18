const mongoose = require('mongoose');

const announcementSchema = new mongoose.Schema({
    announcementText: String,
    likeCount: {
        type: Number,
        default: 0
      },
    active: {
    type: Boolean,
    default: true,
    select: false
  },
},
{
  timestamps: true
});


const announcement = mongoose.model('Announcement', announcementSchema);

module.exports = announcement;
