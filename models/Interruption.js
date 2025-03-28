const mongoose = require('mongoose');

const interruptionSchema = new mongoose.Schema({
    substationName: String,
    feederName: String,
    cause: String,
    fromDatetime: Date,
    toDatetime: Date,
    duration: String
});

module.exports = mongoose.model('Interruption', interruptionSchema);