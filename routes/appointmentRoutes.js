const express = require('express');
const router = express.Router();

// Test data
let appointments = [
  { 
    id: 1, 
    patientId: 1, 
    doctorId: 1, 
    startAt: '2024-12-10T10:00:00.000Z',
    endAt: '2024-12-10T11:00:00.000Z',
    notes: 'Regular checkup',
    status: 'scheduled'
  }
];

// GET all appointments
router.get('/', (req, res) => {
  res.json(appointments);
});

// GET single appointment
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const appointment = appointments.find(a => a.id === id);
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  res.json(appointment);
});

// POST create appointment
router.post('/', (req, res) => {
  const newAppointment = {
    id: appointments.length + 1,
    patientId: req.body.patientId,
    doctorId: req.body.doctorId,
    startAt: req.body.startAt,
    endAt: req.body.endAt,
    notes: req.body.notes || '',
    status: req.body.status || 'scheduled'
  };
  appointments.push(newAppointment);
  res.status(201).json(newAppointment);
});

// PUT update appointment
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const appointment = appointments.find(a => a.id === id);
  if (!appointment) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  
  appointment.patientId = req.body.patientId || appointment.patientId;
  appointment.doctorId = req.body.doctorId || appointment.doctorId;
  appointment.startAt = req.body.startAt || appointment.startAt;
  appointment.endAt = req.body.endAt || appointment.endAt;
  appointment.notes = req.body.notes || appointment.notes;
  appointment.status = req.body.status || appointment.status;
  
  res.json(appointment);
});

// DELETE appointment
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = appointments.findIndex(a => a.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Appointment not found' });
  }
  
  appointments.splice(index, 1);
  res.json({ message: 'Appointment deleted successfully' });
});

module.exports = router;