const express = require('express');
const app = express();
const PORT = 5001;

// Enable CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    
    next();
});

app.use(express.json());

// Sample data
let patients = [
    { 
        id: 1, 
        name: 'John Doe', 
        email: 'john@example.com', 
        phone: '123-456-7890', 
        birthDate: '1985-05-15',
        gender: 'male',
        address: '123 Main St, City',
        status: 'active'
    },
    { 
        id: 2, 
        name: 'Jane Smith', 
        email: 'jane@example.com', 
        phone: '987-654-3210', 
        birthDate: '1990-08-22',
        gender: 'female',
        address: '456 Oak Ave, Town',
        status: 'active'
    }
];

let doctors = [
    { id: 1, name: 'Dr. Sarah Johnson', specialty: 'Cardiology' },
    { id: 2, name: 'Dr. Mike Brown', specialty: 'Orthopedics' },
    { id: 3, name: 'Dr. Lisa Wang', specialty: 'Pediatrics' }
];

let appointments = [
    { 
        id: 1, 
        patientId: 1, 
        doctorId: 1, 
        startAt: new Date().toISOString(),
        endAt: new Date(Date.now() + 3600000).toISOString(),
        notes: 'Regular checkup',
        status: 'scheduled'
    }
];

// Base route
app.get('/', (req, res) => {
    res.json({
        message: 'Clinic Appointment System API',
        version: '1.0.0',
        endpoints: {
            patients: '/api/patients',
            doctors: '/api/doctors',
            appointments: '/api/appointments'
        }
    });
});

// Patients routes
app.get('/api/patients', (req, res) => {
    res.json(patients);
});

app.get('/api/patients/:id', (req, res) => {
    const patient = patients.find(p => p.id === parseInt(req.params.id));
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    res.json(patient);
});

app.post('/api/patients', (req, res) => {
    const newPatient = {
        id: patients.length + 1,
        ...req.body
    };
    patients.push(newPatient);
    res.status(201).json(newPatient);
});

app.put('/api/patients/:id', (req, res) => {
    const patient = patients.find(p => p.id === parseInt(req.params.id));
    if (!patient) return res.status(404).json({ error: 'Patient not found' });
    
    Object.assign(patient, req.body);
    res.json(patient);
});

app.delete('/api/patients/:id', (req, res) => {
    const index = patients.findIndex(p => p.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: 'Patient not found' });
    
    patients.splice(index, 1);
    res.json({ message: 'Patient deleted successfully' });
});

// Doctors routes
app.get('/api/doctors', (req, res) => {
    res.json(doctors);
});

// Appointments routes
app.get('/api/appointments', (req, res) => {
    res.json(appointments);
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        data: {
            patients: patients.length,
            doctors: doctors.length,
            appointments: appointments.length
        }
    });
});

app.listen(PORT, () => {
    console.log(`✅ Clinic Appointment System API running on http://localhost:${PORT}`);
    console.log(`📊 Sample data loaded:`);
    console.log(`   Patients: ${patients.length}`);
    console.log(`   Doctors: ${doctors.length}`);
    console.log(`   Appointments: ${appointments.length}`);
    console.log(`🌐 API Endpoints:`);
    console.log(`   http://localhost:${PORT}/`);
    console.log(`   http://localhost:${PORT}/api/patients`);
    console.log(`   http://localhost:${PORT}/api/doctors`);
    console.log(`   http://localhost:${PORT}/api/appointments`);
});