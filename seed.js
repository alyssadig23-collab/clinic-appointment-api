require('dotenv').config();
const mongoose = require('mongoose');
const Patient = require('./models/Patient');
const Doctor = require('./models/Doctor');
const Appointment = require('./models/Appointment');

const connectDB = require('./config/db');

// Clear and seed database
const seedDatabase = async () => {
  try {
    await connectDB();
    
    // Clear existing data
    await Patient.deleteMany({});
    await Doctor.deleteMany({});
    await Appointment.deleteMany({});

    // Create patients
    const patients = await Patient.insertMany([
      {
        name: 'John Doe',
        birthDate: '1985-05-15',
        email: 'john@example.com',
        phone: '123-456-7890'
      },
      {
        name: 'Jane Smith',
        birthDate: '1990-08-22',
        email: 'jane@example.com',
        phone: '987-654-3210'
      }
    ]);

    // Create doctors
    const doctors = await Doctor.insertMany([
      {
        name: 'Dr. Sarah Johnson',
        specialty: 'Cardiology'
      },
      {
        name: 'Dr. Mike Brown',
        specialty: 'Orthopedics'
      }
    ]);

    // Create appointments
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);

    const appointments = await Appointment.insertMany([
      {
        patientId: patients[0]._id,
        doctorId: doctors[0]._id,
        startAt: tomorrow,
        endAt: new Date(tomorrow.getTime() + 60 * 60 * 1000), // 1 hour later
        notes: 'Regular checkup'
      }
    ]);

    console.log('Database seeded successfully!');
    console.log(`Created: ${patients.length} patients, ${doctors.length} doctors, ${appointments.length} appointments`);
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();