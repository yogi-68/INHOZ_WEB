// INHOZ Sample Data Seed Script
// Run this after init-db.js to populate the database with test data

use('inhoz');

print('=== Seeding Sample Data ===\n');

const bcrypt = require('bcryptjs'); // Note: Install bcryptjs in your backend
const { ObjectId } = require('mongodb');

// Helper to hash passwords (use actual bcrypt in backend)
const hashPassword = (password) => {
  // In actual backend, use: await bcrypt.hash(password, 10)
  return '$2a$10$exampleHashedPassword'; // Placeholder
};

// ============================================
// 1. CREATE ADMIN USER
// ============================================
print('Creating admin user...');

const adminUserId = new ObjectId();
db.users.insertOne({
  _id: adminUserId,
  email: 'admin@inhoz.com',
  passwordHash: hashPassword('admin123'),
  role: 'admin',
  profile: {
    firstName: 'System',
    lastName: 'Administrator',
    phone: '+1-555-0100',
    avatarUrl: null
  },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null
});

print('✓ Admin user created (admin@inhoz.com / admin123)\n');

// ============================================
// 2. CREATE DOCTORS
// ============================================
print('Creating doctor users...');

const doctor1UserId = new ObjectId();
const doctor1Id = new ObjectId();

db.users.insertOne({
  _id: doctor1UserId,
  email: 'dr.smith@inhoz.com',
  passwordHash: hashPassword('doctor123'),
  role: 'doctor',
  profile: {
    firstName: 'John',
    lastName: 'Smith',
    phone: '+1-555-0101',
    avatarUrl: null
  },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null
});

db.doctors.insertOne({
  _id: doctor1Id,
  userId: doctor1UserId,
  specialty: 'Cardiology',
  credentials: ['MD', 'FACC', 'Board Certified'],
  availability: [
    { day: 'Monday', from: '09:00', to: '17:00' },
    { day: 'Tuesday', from: '09:00', to: '17:00' },
    { day: 'Wednesday', from: '09:00', to: '17:00' },
    { day: 'Thursday', from: '09:00', to: '17:00' },
    { day: 'Friday', from: '09:00', to: '15:00' }
  ],
  assignedPatients: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null
});

const doctor2UserId = new ObjectId();
const doctor2Id = new ObjectId();

db.users.insertOne({
  _id: doctor2UserId,
  email: 'dr.johnson@inhoz.com',
  passwordHash: hashPassword('doctor123'),
  role: 'doctor',
  profile: {
    firstName: 'Emily',
    lastName: 'Johnson',
    phone: '+1-555-0102',
    avatarUrl: null
  },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null
});

db.doctors.insertOne({
  _id: doctor2Id,
  userId: doctor2UserId,
  specialty: 'Emergency Medicine',
  credentials: ['MD', 'FACEP'],
  availability: [
    { day: 'Monday', from: '08:00', to: '20:00' },
    { day: 'Wednesday', from: '08:00', to: '20:00' },
    { day: 'Friday', from: '08:00', to: '20:00' },
    { day: 'Saturday', from: '10:00', to: '18:00' }
  ],
  assignedPatients: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null
});

print('✓ 2 doctors created\n');

// ============================================
// 3. CREATE PATIENTS
// ============================================
print('Creating patient users...');

const patient1UserId = new ObjectId();
const patient1Id = new ObjectId();

db.users.insertOne({
  _id: patient1UserId,
  email: 'patient1@example.com',
  passwordHash: hashPassword('patient123'),
  role: 'patient',
  profile: {
    firstName: 'Robert',
    lastName: 'Williams',
    phone: '+1-555-0201',
    avatarUrl: null
  },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null
});

db.patients.insertOne({
  _id: patient1Id,
  userId: patient1UserId,
  hospitalId: 'H001-2025-001',
  roomNo: '301',
  age: 65,
  gender: 'M',
  emergencyContact: {
    name: 'Mary Williams',
    phone: '+1-555-0301'
  },
  status: 'monitoring',
  assignedDoctorId: doctor1Id,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null
});

// Update doctor's assigned patients
db.doctors.updateOne(
  { _id: doctor1Id },
  { $push: { assignedPatients: patient1Id } }
);

const patient2UserId = new ObjectId();
const patient2Id = new ObjectId();

db.users.insertOne({
  _id: patient2UserId,
  email: 'patient2@example.com',
  passwordHash: hashPassword('patient123'),
  role: 'patient',
  profile: {
    firstName: 'Sarah',
    lastName: 'Davis',
    phone: '+1-555-0202',
    avatarUrl: null
  },
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null
});

db.patients.insertOne({
  _id: patient2Id,
  userId: patient2UserId,
  hospitalId: 'H001-2025-002',
  roomNo: '305',
  age: 42,
  gender: 'F',
  emergencyContact: {
    name: 'James Davis',
    phone: '+1-555-0302'
  },
  status: 'admitted',
  assignedDoctorId: doctor2Id,
  createdAt: new Date(),
  updatedAt: new Date(),
  deletedAt: null
});

// Update doctor's assigned patients
db.doctors.updateOne(
  { _id: doctor2Id },
  { $push: { assignedPatients: patient2Id } }
);

print('✓ 2 patients created\n');

// ============================================
// 4. CREATE ASSIGNMENTS
// ============================================
print('Creating assignment records...');

db.assignments.insertMany([
  {
    _id: new ObjectId(),
    patientId: patient1Id,
    doctorId: doctor1Id,
    assignedBy: adminUserId,
    from: new Date('2025-11-20'),
    to: null,
    notes: 'Post-cardiac procedure monitoring',
    createdAt: new Date('2025-11-20')
  },
  {
    _id: new ObjectId(),
    patientId: patient2Id,
    doctorId: doctor2Id,
    assignedBy: adminUserId,
    from: new Date('2025-11-25'),
    to: null,
    notes: 'Emergency admission - pneumonia',
    createdAt: new Date('2025-11-25')
  }
]);

print('✓ Assignment records created\n');

// ============================================
// 5. CREATE SAMPLE VITALS
// ============================================
print('Creating sample vitals data...');

const now = new Date();
const vitalsData = [];

// Generate vitals for last 24 hours for patient1
for (let i = 0; i < 24; i++) {
  const timestamp = new Date(now - i * 60 * 60 * 1000); // Every hour
  vitalsData.push({
    meta: {
      patientId: patient1Id,
      deviceId: 'device-301'
    },
    timestamp: timestamp,
    heartRate: 72 + Math.floor(Math.random() * 10),
    bloodPressure: {
      systolic: 120 + Math.floor(Math.random() * 10),
      diastolic: 80 + Math.floor(Math.random() * 10)
    },
    temperature: 36.5 + Math.random() * 0.8,
    spO2: 95 + Math.floor(Math.random() * 5),
    respiratoryRate: 16 + Math.floor(Math.random() * 4),
    ivLevel: 500 - (i * 20),
    glucose: 90 + Math.floor(Math.random() * 20),
    painScale: Math.floor(Math.random() * 3),
    raw: { battery: '85%', signalStrength: 'good' }
  });
}

// Generate vitals for patient2
for (let i = 0; i < 24; i++) {
  const timestamp = new Date(now - i * 60 * 60 * 1000);
  vitalsData.push({
    meta: {
      patientId: patient2Id,
      deviceId: 'device-305'
    },
    timestamp: timestamp,
    heartRate: 88 + Math.floor(Math.random() * 15),
    bloodPressure: {
      systolic: 130 + Math.floor(Math.random() * 15),
      diastolic: 85 + Math.floor(Math.random() * 10)
    },
    temperature: 37.8 + Math.random() * 0.6,
    spO2: 92 + Math.floor(Math.random() * 6),
    respiratoryRate: 20 + Math.floor(Math.random() * 5),
    ivLevel: 750 - (i * 30),
    glucose: 110 + Math.floor(Math.random() * 25),
    painScale: 3 + Math.floor(Math.random() * 3),
    raw: { battery: '92%', signalStrength: 'excellent' }
  });
}

db.vitals.insertMany(vitalsData);

print(`✓ ${vitalsData.length} vitals records created\n`);

// ============================================
// 6. CREATE SAMPLE ALERTS
// ============================================
print('Creating sample alerts...');

db.alerts.insertMany([
  {
    _id: new ObjectId(),
    patientId: patient1Id,
    type: 'IV_LOW',
    source: 'sensor',
    severity: 'warning',
    message: 'IV fluid level below threshold (120ml remaining)',
    vitalSnapshot: {
      ivLevel: 120,
      timestamp: new Date()
    },
    mlConfidence: null,
    doctorId: doctor1Id,
    createdAt: new Date(now - 2 * 60 * 60 * 1000),
    acknowledgedBy: null,
    acknowledgedAt: null
  },
  {
    _id: new ObjectId(),
    patientId: patient2Id,
    type: 'HIGH_FEVER',
    source: 'sensor',
    severity: 'warning',
    message: 'Temperature elevated: 39.2°C',
    vitalSnapshot: {
      temperature: 39.2,
      heartRate: 102,
      timestamp: new Date()
    },
    mlConfidence: null,
    doctorId: doctor2Id,
    createdAt: new Date(now - 1 * 60 * 60 * 1000),
    acknowledgedBy: doctor2UserId,
    acknowledgedAt: new Date(now - 30 * 60 * 1000)
  }
]);

print('✓ Sample alerts created\n');

// ============================================
// 7. CREATE SAMPLE PRESCRIPTIONS
// ============================================
print('Creating sample prescriptions...');

db.prescriptions.insertMany([
  {
    _id: new ObjectId(),
    patientId: patient1Id,
    doctorId: doctor1Id,
    medicines: [
      {
        name: 'Aspirin',
        dose: '81mg',
        frequency: 'Once daily',
        durationDays: 30
      },
      {
        name: 'Lisinopril',
        dose: '10mg',
        frequency: 'Once daily',
        durationDays: 30
      },
      {
        name: 'Atorvastatin',
        dose: '20mg',
        frequency: 'Once daily at bedtime',
        durationDays: 30
      }
    ],
    tests: ['ECG', 'Lipid Panel', 'Complete Blood Count'],
    notes: 'Follow-up in 2 weeks. Monitor blood pressure daily.',
    validFrom: new Date('2025-11-20'),
    validUntil: new Date('2025-12-20'),
    attachments: [],
    createdAt: new Date('2025-11-20'),
    updatedAt: new Date('2025-11-20')
  },
  {
    _id: new ObjectId(),
    patientId: patient2Id,
    doctorId: doctor2Id,
    medicines: [
      {
        name: 'Amoxicillin',
        dose: '500mg',
        frequency: 'Three times daily',
        durationDays: 7
      },
      {
        name: 'Ibuprofen',
        dose: '400mg',
        frequency: 'Every 6 hours as needed',
        durationDays: 7
      }
    ],
    tests: ['Chest X-Ray', 'Complete Blood Count', 'C-Reactive Protein'],
    notes: 'Complete full course of antibiotics. Return if fever persists after 3 days.',
    validFrom: new Date('2025-11-25'),
    validUntil: new Date('2025-12-02'),
    attachments: [],
    createdAt: new Date('2025-11-25'),
    updatedAt: new Date('2025-11-25')
  }
]);

print('✓ Sample prescriptions created\n');

// ============================================
// 8. CREATE SAMPLE INVOICES
// ============================================
print('Creating sample invoices...');

db.invoices.insertMany([
  {
    _id: new ObjectId(),
    patientId: patient1Id,
    items: [
      { label: 'Consultation - Cardiology', amount: 250.00 },
      { label: 'ECG Test', amount: 150.00 },
      { label: 'Blood Tests (Panel)', amount: 200.00 },
      { label: 'Room Charges (per day)', amount: 500.00 }
    ],
    total: 1100.00,
    issuedBy: adminUserId,
    status: 'pending',
    issuedAt: new Date('2025-11-21'),
    dueAt: new Date('2025-12-21'),
    attachmentUrl: null,
    createdAt: new Date('2025-11-21'),
    updatedAt: new Date('2025-11-21')
  },
  {
    _id: new ObjectId(),
    patientId: patient2Id,
    items: [
      { label: 'Emergency Room Visit', amount: 500.00 },
      { label: 'Chest X-Ray', amount: 200.00 },
      { label: 'Laboratory Tests', amount: 180.00 },
      { label: 'Medications', amount: 120.00 }
    ],
    total: 1000.00,
    issuedBy: adminUserId,
    status: 'paid',
    issuedAt: new Date('2025-11-26'),
    dueAt: new Date('2025-12-26'),
    attachmentUrl: 'https://storage.inhoz.com/invoices/inv-002.pdf',
    createdAt: new Date('2025-11-26'),
    updatedAt: new Date('2025-11-26')
  }
]);

print('✓ Sample invoices created\n');

// ============================================
// 9. CREATE SAMPLE ML EVENTS
// ============================================
print('Creating sample ML events...');

db.ml_events.insertMany([
  {
    _id: new ObjectId(),
    patientId: patient1Id,
    deviceId: 'cam-301',
    event: 'no_movement',
    confidence: 0.78,
    frameUrl: 'https://storage.inhoz.com/frames/frame-001.jpg',
    metadata: {
      modelVersion: 'v1.2.3',
      duration: '15 minutes'
    },
    timestamp: new Date(now - 3 * 60 * 60 * 1000),
    createdAt: new Date(now - 3 * 60 * 60 * 1000)
  }
]);

print('✓ Sample ML events created\n');

// ============================================
// 10. CREATE AUDIT LOGS
// ============================================
print('Creating sample audit logs...');

db.audit_logs.insertMany([
  {
    _id: new ObjectId(),
    actorUserId: adminUserId,
    actorRole: 'admin',
    action: 'CREATE_ASSIGNMENT',
    resource: 'assignments',
    resourceId: patient1Id,
    before: null,
    after: {
      patientId: patient1Id,
      doctorId: doctor1Id
    },
    ip: '192.168.1.100',
    requestId: 'req-001',
    createdAt: new Date('2025-11-20')
  },
  {
    _id: new ObjectId(),
    actorUserId: doctor2UserId,
    actorRole: 'doctor',
    action: 'ACKNOWLEDGE_ALERT',
    resource: 'alerts',
    resourceId: new ObjectId(),
    before: { acknowledgedAt: null },
    after: { acknowledgedAt: new Date() },
    ip: '192.168.1.101',
    requestId: 'req-002',
    createdAt: new Date(now - 30 * 60 * 1000)
  }
]);

print('✓ Sample audit logs created\n');

// ============================================
// SUMMARY
// ============================================
print('\n=== Database Seeding Complete ===\n');
print('Summary:');
print('  - 1 Admin user');
print('  - 2 Doctors');
print('  - 2 Patients');
print('  - 2 Assignments');
print(`  - ${vitalsData.length} Vitals records`);
print('  - 2 Alerts');
print('  - 2 Prescriptions');
print('  - 2 Invoices');
print('  - 1 ML Event');
print('  - 2 Audit Log entries\n');

print('Test Credentials:');
print('  Admin:    admin@inhoz.com / admin123');
print('  Doctor 1: dr.smith@inhoz.com / doctor123');
print('  Doctor 2: dr.johnson@inhoz.com / doctor123');
print('  Patient 1: patient1@example.com / patient123');
print('  Patient 2: patient2@example.com / patient123\n');

print('⚠ Remember to change these passwords in production!\n');
