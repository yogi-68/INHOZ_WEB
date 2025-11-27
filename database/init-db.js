// INHOZ Database Initialization Script
// Run this script after connecting to MongoDB Atlas

// Use the INHOZ database
use('inhoz');

print('=== INHOZ Database Initialization ===\n');

// ============================================
// 1. CREATE TIME-SERIES COLLECTION FOR VITALS
// ============================================
print('Creating time-series collection: vitals');

try {
  db.createCollection('vitals', {
    timeseries: {
      timeField: 'timestamp',
      metaField: 'meta',
      granularity: 'seconds'
    },
    expireAfterSeconds: 31536000 // 1 year retention
  });
  print('✓ Time-series collection "vitals" created\n');
} catch (e) {
  if (e.code === 48) {
    print('⚠ Collection "vitals" already exists\n');
  } else {
    print('✗ Error creating vitals collection:', e.message, '\n');
  }
}

// ============================================
// 2. CREATE STANDARD COLLECTIONS
// ============================================
const collections = [
  'users',
  'doctors',
  'patients',
  'assignments',
  'prescriptions',
  'invoices',
  'ml_events',
  'alerts',
  'audit_logs'
];

collections.forEach(collectionName => {
  try {
    db.createCollection(collectionName);
    print(`✓ Collection "${collectionName}" created`);
  } catch (e) {
    if (e.code === 48) {
      print(`⚠ Collection "${collectionName}" already exists`);
    } else {
      print(`✗ Error creating ${collectionName}:`, e.message);
    }
  }
});

print('\n=== Creating Indexes ===\n');

// ============================================
// 3. CREATE INDEXES
// ============================================

// --- Users Collection ---
print('Creating indexes for users...');
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ isActive: 1 });
db.users.createIndex({ deletedAt: 1 });
print('✓ Users indexes created\n');

// --- Doctors Collection ---
print('Creating indexes for doctors...');
db.doctors.createIndex({ userId: 1 }, { unique: true });
db.doctors.createIndex({ specialty: 1 });
db.doctors.createIndex({ 'assignedPatients': 1 });
db.doctors.createIndex({ deletedAt: 1 });
print('✓ Doctors indexes created\n');

// --- Patients Collection ---
print('Creating indexes for patients...');
db.patients.createIndex({ userId: 1 }, { unique: true });
db.patients.createIndex({ assignedDoctorId: 1 });
db.patients.createIndex({ hospitalId: 1 });
db.patients.createIndex({ status: 1 });
db.patients.createIndex({ roomNo: 1 });
db.patients.createIndex({ deletedAt: 1 });
print('✓ Patients indexes created\n');

// --- Assignments Collection ---
print('Creating indexes for assignments...');
db.assignments.createIndex({ patientId: 1, createdAt: -1 });
db.assignments.createIndex({ doctorId: 1, createdAt: -1 });
db.assignments.createIndex({ assignedBy: 1 });
db.assignments.createIndex({ from: 1, to: 1 });
print('✓ Assignments indexes created\n');

// --- Prescriptions Collection ---
print('Creating indexes for prescriptions...');
db.prescriptions.createIndex({ patientId: 1, createdAt: -1 });
db.prescriptions.createIndex({ doctorId: 1, createdAt: -1 });
db.prescriptions.createIndex({ validFrom: 1, validUntil: 1 });
print('✓ Prescriptions indexes created\n');

// --- Invoices Collection ---
print('Creating indexes for invoices...');
db.invoices.createIndex({ patientId: 1, issuedAt: -1 });
db.invoices.createIndex({ status: 1 });
db.invoices.createIndex({ issuedBy: 1 });
db.invoices.createIndex({ issuedAt: 1 });
print('✓ Invoices indexes created\n');

// --- Vitals Collection (Time-Series) ---
print('Creating indexes for vitals...');
db.vitals.createIndex({ 'meta.patientId': 1, timestamp: -1 });
db.vitals.createIndex({ 'meta.deviceId': 1 });
print('✓ Vitals indexes created\n');

// --- ML Events Collection ---
print('Creating indexes for ml_events...');
db.ml_events.createIndex({ patientId: 1, timestamp: -1 });
db.ml_events.createIndex({ deviceId: 1 });
db.ml_events.createIndex({ event: 1 });
db.ml_events.createIndex({ timestamp: -1 });
db.ml_events.createIndex({ confidence: -1 });
print('✓ ML Events indexes created\n');

// --- Alerts Collection ---
print('Creating indexes for alerts...');
db.alerts.createIndex({ patientId: 1, createdAt: -1 });
db.alerts.createIndex({ doctorId: 1, acknowledgedAt: 1 });
db.alerts.createIndex({ severity: 1, createdAt: -1 });
db.alerts.createIndex({ source: 1 });
db.alerts.createIndex({ type: 1 });
db.alerts.createIndex({ acknowledgedBy: 1 });
print('✓ Alerts indexes created\n');

// --- Audit Logs Collection ---
print('Creating indexes for audit_logs...');
db.audit_logs.createIndex({ actorUserId: 1, createdAt: -1 });
db.audit_logs.createIndex({ resource: 1, resourceId: 1 });
db.audit_logs.createIndex({ action: 1, createdAt: -1 });
db.audit_logs.createIndex({ createdAt: -1 });
print('✓ Audit Logs indexes created\n');

print('=== Database Initialization Complete ===');
print('\nNext steps:');
print('1. Run seed-data.js to populate sample data');
print('2. Configure environment variables in backend');
print('3. Start the backend server\n');
