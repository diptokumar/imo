const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  gameName: {
    type: String,
    required: [true, 'Please tell us your name!']
  },
  image: String,
  about: String,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
},
{
  timestamps: true
});


const game = mongoose.model('Game', gameSchema);

module.exports = game;
