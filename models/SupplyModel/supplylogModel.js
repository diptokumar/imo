const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);

const supplylogSchema = new mongoose.Schema({
    seller: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    },
    givenBdt: {
        type: Number,
        default: 0
    },
    takenBdt: {
        type: Number,
        default: 0
    },
    supplyStatus: {
        type: String,
        enum: ['Given', 'Taken'],
        default: 'Given'
    },
    note: String
},
{
  timestamps: true
});

supplylogSchema.plugin(AutoIncrement, { inc_field: 'supplyLogNo' });

const supplylog = mongoose.model('Supplylog', supplylogSchema);

module.exports = supplylog;
