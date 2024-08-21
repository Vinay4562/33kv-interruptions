// models/Interruption.js
const mongoose = require('mongoose');

const interruptionSchema = new mongoose.Schema({
    substationName: String,
    feederName: String,
    cause: String,
    fromDatetime: Date, // Ensure this field exists
    toDatetime: Date,   // Ensure this field exists
    duration: String
});

module.exports = mongoose.model('Interruption', interruptionSchema);
