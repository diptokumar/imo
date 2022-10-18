const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
   
  notificationTitle: String,
  description: {
      type: String,
      required: [true, 'Please fill up the box!']
  },
  likeCount: {
      type: Number,
      default: 0
  },
  active: {
    type: Boolean,
    default: true,
    select: false
  }
},
{
  timestamps: true
});


const notification = mongoose.model('Notification', notificationSchema);

module.exports = notification;
