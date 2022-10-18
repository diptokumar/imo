const mongoose = require('mongoose');

const adsSchema = new mongoose.Schema({
    adsName: String,
    image: {
        type: String,
        required: [true, 'Please upload an image!']
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


const category = mongoose.model('Ads', adsSchema);

module.exports = category;
