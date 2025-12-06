const Appointment = require('../models/Appointment');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');

// @desc    Get all appointments with populated data
// @route   GET /api/appointments
exports.getAppointments = async (req, res) => {
  try {
    const appointments = await Appointment.find()
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialty')
      .sort({ startAt: 1 });
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single appointment
// @route   GET /api/appointments/:id
exports.getAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email phone birthDate')
      .populate('doctorId', 'name specialty');
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create appointment with validation
// @route   POST /api/appointments
exports.createAppointment = async (req, res) => {
  try {
    // Check if patient exists
    const patient = await Patient.findById(req.body.patientId);
    if (!patient) {
      return res.status(404).json({ message: 'Patient not found' });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(req.body.doctorId);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    // Check for appointment conflicts (same doctor, overlapping time)
    const conflictingAppointment = await Appointment.findOne({
      doctorId: req.body.doctorId,
      status: 'scheduled',
      $or: [
        {
          startAt: { $lt: new Date(req.body.endAt) },
          endAt: { $gt: new Date(req.body.startAt) }
        }
      ]
    });

    if (conflictingAppointment) {
      return res.status(400).json({ 
        message: 'Doctor already has an appointment scheduled during this time' 
      });
    }

    // Check if patient has conflicting appointment
    const patientConflict = await Appointment.findOne({
      patientId: req.body.patientId,
      status: 'scheduled',
      $or: [
        {
          startAt: { $lt: new Date(req.body.endAt) },
          endAt: { $gt: new Date(req.body.startAt) }
        }
      ]
    });

    if (patientConflict) {
      return res.status(400).json({ 
        message: 'Patient already has an appointment scheduled during this time' 
      });
    }

    // Validate appointment duration (max 4 hours)
    const duration = (new Date(req.body.endAt) - new Date(req.body.startAt)) / (1000 * 60 * 60);
    if (duration > 4) {
      return res.status(400).json({ 
        message: 'Appointment cannot exceed 4 hours' 
      });
    }

    // Validate future appointment
    if (new Date(req.body.startAt) < new Date()) {
      return res.status(400).json({ 
        message: 'Appointment must be scheduled for future time' 
      });
    }

    // Create appointment
    const appointment = await Appointment.create(req.body);
    
    // Populate the response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name email phone')
      .populate('doctorId', 'name specialty');
    
    res.status(201).json(populatedAppointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update appointment
// @route   PUT /api/appointments/:id
exports.updateAppointment = async (req, res) => {
  try {
    let appointment = await Appointment.findById(req.params.id);
    
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // If updating time or doctor, check for conflicts
    if (req.body.startAt || req.body.endAt || req.body.doctorId) {
      const startAt = req.body.startAt ? new Date(req.body.startAt) : appointment.startAt;
      const endAt = req.body.endAt ? new Date(req.body.endAt) : appointment.endAt;
      const doctorId = req.body.doctorId || appointment.doctorId.toString();

      // Check for conflicts excluding current appointment
      const conflictingAppointment = await Appointment.findOne({
        _id: { $ne: req.params.id },
        doctorId: doctorId,
        status: 'scheduled',
        $or: [
          {
            startAt: { $lt: endAt },
            endAt: { $gt: startAt }
          }
        ]
      });

      if (conflictingAppointment) {
        return res.status(400).json({ 
          message: 'Doctor already has an appointment scheduled during this time' 
        });
      }

      // Validate duration
      const duration = (endAt - startAt) / (1000 * 60 * 60);
      if (duration > 4) {
        return res.status(400).json({ 
          message: 'Appointment cannot exceed 4 hours' 
        });
      }
    }

    // Update appointment
    appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('patientId', 'name email phone')
     .populate('doctorId', 'name specialty');

    res.json(appointment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete appointment
// @route   DELETE /api/appointments/:id
exports.deleteAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get appointments by doctor
// @route   GET /api/appointments/doctor/:doctorId
exports.getAppointmentsByDoctor = async (req, res) => {
  try {
    const appointments = await Appointment.find({ 
      doctorId: req.params.doctorId 
    })
    .populate('patientId', 'name email phone')
    .sort({ startAt: 1 });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get appointments by patient
// @route   GET /api/appointments/patient/:patientId
exports.getAppointmentsByPatient = async (req, res) => {
  try {
    const appointments = await Appointment.find({ 
      patientId: req.params.patientId 
    })
    .populate('doctorId', 'name specialty')
    .sort({ startAt: 1 });
    
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};