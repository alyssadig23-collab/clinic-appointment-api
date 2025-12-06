const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Please add a patient']
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: [true, 'Please add a doctor']
  },
  startAt: {
    type: Date,
    required: [true, 'Please add start time']
  },
  endAt: {
    type: Date,
    required: [true, 'Please add end time']
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  status: {
    type: String,
    enum: ['scheduled', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Validate that end time is after start time
appointmentSchema.pre('save', function(next) {
  if (this.endAt <= this.startAt) {
    next(new Error('End time must be after start time'));
  }
  next();
});

module.exports = mongoose.model('Appointment', appointmentSchema);