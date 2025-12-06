const express = require('express');
const router = express.Router();

// Test data
let doctors = [
  { id: 1, name: 'Dr. Sarah Johnson', specialty: 'Cardiology' },
  { id: 2, name: 'Dr. Mike Brown', specialty: 'Orthopedics' }
];

// GET all doctors
router.get('/', (req, res) => {
  res.json(doctors);
});

// GET single doctor
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const doctor = doctors.find(d => d.id === id);
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }
  res.json(doctor);
});

// POST create doctor
router.post('/', (req, res) => {
  const newDoctor = {
    id: doctors.length + 1,
    name: req.body.name,
    specialty: req.body.specialty
  };
  doctors.push(newDoctor);
  res.status(201).json(newDoctor);
});

// PUT update doctor
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const doctor = doctors.find(d => d.id === id);
  if (!doctor) {
    return res.status(404).json({ error: 'Doctor not found' });
  }
  
  doctor.name = req.body.name || doctor.name;
  doctor.specialty = req.body.specialty || doctor.specialty;
  
  res.json(doctor);
});

// DELETE doctor
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = doctors.findIndex(d => d.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Doctor not found' });
  }
  
  doctors.splice(index, 1);
  res.json({ message: 'Doctor deleted successfully' });
});

module.exports = router;