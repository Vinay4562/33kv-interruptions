const mongoose = require('mongoose');

const interruptionSchema = new mongoose.Schema({
    substationName: String,
    feederName: String,
    cause: String,
    fromDatetime: String, // Store as ISO string (e.g., "2025-03-28T01:01:00.000+05:30")
    toDatetime: String,   // Store as ISO string
    duration: String
});

module.exports = mongoose.model('Interruption', interruptionSchema);