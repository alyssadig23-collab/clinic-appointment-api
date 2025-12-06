const express = require('express');
const router = express.Router();

// Test data
let patients = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', birthDate: '1985-05-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '987-654-3210', birthDate: '1990-08-22' }
];

// GET all patients
router.get('/', (req, res) => {
  res.json(patients);
});

// GET single patient
router.get('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const patient = patients.find(p => p.id === id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  res.json(patient);
});

// POST create patient
router.post('/', (req, res) => {
  const newPatient = {
    id: patients.length + 1,
    name: req.body.name,
    email: req.body.email,
    phone: req.body.phone,
    birthDate: req.body.birthDate
  };
  patients.push(newPatient);
  res.status(201).json(newPatient);
});

// PUT update patient
router.put('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const patient = patients.find(p => p.id === id);
  if (!patient) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  
  patient.name = req.body.name || patient.name;
  patient.email = req.body.email || patient.email;
  patient.phone = req.body.phone || patient.phone;
  patient.birthDate = req.body.birthDate || patient.birthDate;
  
  res.json(patient);
});

// DELETE patient
router.delete('/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const index = patients.findIndex(p => p.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Patient not found' });
  }
  
  patients.splice(index, 1);
  res.json({ message: 'Patient deleted successfully' });
});

module.exports = router;