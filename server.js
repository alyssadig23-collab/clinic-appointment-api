const express = require('express');
const app = express();
const PORT = 5001;

// Middleware to parse JSON
app.use(express.json());

// In-memory data storage
let patients = [
  { id: 1, name: 'John Doe', email: 'john@example.com', phone: '123-456-7890', birthDate: '1985-05-15' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', phone: '987-654-3210', birthDate: '1990-08-22' }
];

let doctors = [
  { id: 1, name: 'Dr. Sarah Johnson', specialty: 'Cardiology' },
  { id: 2, name: 'Dr. Mike Brown', specialty: 'Orthopedics' }
];

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

// ===== BASE ROUTE =====
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to Clinic Appointment API',
    endpoints: {
      patients: {
        getAll: 'GET /api/patients',
        getOne: 'GET /api/patients/:id',
        create: 'POST /api/patients',
        update: 'PUT /api/patients/:id',
        delete: 'DELETE /api/patients/:id'
      },
      doctors: {
        getAll: 'GET /api/doctors',
        getOne: 'GET /api/doctors/:id',
        create: 'POST /api/doctors',
        update: 'PUT /api/doctors/:id',
        delete: 'DELETE /api/doctors/:id'
      },
      appointments: {
        getAll: 'GET /api/appointments',
        getOne: 'GET /api/appointments/:id',
        create: 'POST /api/appointments',
        update: 'PUT /api/appointments/:id',
        delete: 'DELETE /api/appointments/:id'
      }
    }
  });
});

// ===== PATIENT ROUTES =====
// GET all patients
app.get('/api/patients', (req, res) => {
  res.json(patients);
});

// GET single patient
app.get('/api/patients/:id', (req, res) => {
  const patient = patients.find(p => p.id === parseInt(req.params.id));
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  res.json(patient);
});

// POST create patient
app.post('/api/patients', (req, res) => {
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
app.put('/api/patients/:id', (req, res) => {
  const patient = patients.find(p => p.id === parseInt(req.params.id));
  if (!patient) return res.status(404).json({ error: 'Patient not found' });
  
  patient.name = req.body.name || patient.name;
  patient.email = req.body.email || patient.email;
  patient.phone = req.body.phone || patient.phone;
  patient.birthDate = req.body.birthDate || patient.birthDate;
  
  res.json(patient);
});

// DELETE patient
app.delete('/api/patients/:id', (req, res) => {
  const index = patients.findIndex(p => p.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Patient not found' });
  
  patients.splice(index, 1);
  res.json({ message: 'Patient deleted successfully' });
});

// ===== DOCTOR ROUTES =====
// GET all doctors
app.get('/api/doctors', (req, res) => {
  res.json(doctors);
});

// GET single doctor
app.get('/api/doctors/:id', (req, res) => {
  const doctor = doctors.find(d => d.id === parseInt(req.params.id));
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  res.json(doctor);
});

// POST create doctor
app.post('/api/doctors', (req, res) => {
  const newDoctor = {
    id: doctors.length + 1,
    name: req.body.name,
    specialty: req.body.specialty
  };
  doctors.push(newDoctor);
  res.status(201).json(newDoctor);
});

// PUT update doctor
app.put('/api/doctors/:id', (req, res) => {
  const doctor = doctors.find(d => d.id === parseInt(req.params.id));
  if (!doctor) return res.status(404).json({ error: 'Doctor not found' });
  
  doctor.name = req.body.name || doctor.name;
  doctor.specialty = req.body.specialty || doctor.specialty;
  
  res.json(doctor);
});

// DELETE doctor
app.delete('/api/doctors/:id', (req, res) => {
  const index = doctors.findIndex(d => d.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Doctor not found' });
  
  doctors.splice(index, 1);
  res.json({ message: 'Doctor deleted successfully' });
});

// ===== APPOINTMENT ROUTES =====
// GET all appointments
app.get('/api/appointments', (req, res) => {
  res.json(appointments);
});

// GET single appointment
app.get('/api/appointments/:id', (req, res) => {
  const appointment = appointments.find(a => a.id === parseInt(req.params.id));
  if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
  res.json(appointment);
});

// POST create appointment
app.post('/api/appointments', (req, res) => {
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
app.put('/api/appointments/:id', (req, res) => {
  const appointment = appointments.find(a => a.id === parseInt(req.params.id));
  if (!appointment) return res.status(404).json({ error: 'Appointment not found' });
  
  appointment.patientId = req.body.patientId || appointment.patientId;
  appointment.doctorId = req.body.doctorId || appointment.doctorId;
  appointment.startAt = req.body.startAt || appointment.startAt;
  appointment.endAt = req.body.endAt || appointment.endAt;
  appointment.notes = req.body.notes || appointment.notes;
  appointment.status = req.body.status || appointment.status;
  
  res.json(appointment);
});

// DELETE appointment
app.delete('/api/appointments/:id', (req, res) => {
  const index = appointments.findIndex(a => a.id === parseInt(req.params.id));
  if (index === -1) return res.status(404).json({ error: 'Appointment not found' });
  
  appointments.splice(index, 1);
  res.json({ message: 'Appointment deleted successfully' });
});

app.listen(PORT, () => {
  console.log(`✅ Clinic Appointment API running on http://localhost:${PORT}`);
  console.log(`📚 Try: curl http://localhost:${PORT}/api/patients`);
});
