const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a name'],
    trim: true
  },
  specialty: {
    type: String,
    required: [true, 'Please add a specialty'],
    enum: ['Cardiology', 'Dermatology', 'Orthopedics', 'Pediatrics', 'Neurology', 'General']
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Doctor', doctorSchema);