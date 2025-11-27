require('dotenv').config({ path: '../backend/.env' });
const { MongoClient } = require('mongodb');

async function initializeDatabase() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in backend/.env file');
    console.log('\nPlease add your MongoDB Atlas connection string to backend/.env:');
    console.log('MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/inhoz');
    process.exit(1);
  }

  console.log('🔄 Connecting to MongoDB Atlas...\n');
  
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas!\n');

    const db = client.db('inhoz');

    console.log('=== Creating Collections ===\n');

    // Create time-series collection for vitals
    try {
      await db.createCollection('vitals', {
        timeseries: {
          timeField: 'timestamp',
          metaField: 'meta',
          granularity: 'seconds'
        },
        expireAfterSeconds: 31536000
      });
      console.log('✓ Time-series collection "vitals" created');
    } catch (e) {
      if (e.code === 48) {
        console.log('⚠ Collection "vitals" already exists');
      } else {
        console.log('✗ Error creating vitals:', e.message);
      }
    }

    // Create standard collections
    const collections = [
      'users', 'doctors', 'patients', 'assignments',
      'prescriptions', 'invoices', 'ml_events', 'alerts', 'audit_logs'
    ];

    for (const collName of collections) {
      try {
        await db.createCollection(collName);
        console.log(`✓ Collection "${collName}" created`);
      } catch (e) {
        if (e.code === 48) {
          console.log(`⚠ Collection "${collName}" already exists`);
        }
      }
    }

    console.log('\n=== Creating Indexes ===\n');

    // Users indexes
    await db.collection('users').createIndex({ email: 1 }, { unique: true });
    await db.collection('users').createIndex({ role: 1 });
    console.log('✓ Users indexes created');

    // Doctors indexes
    await db.collection('doctors').createIndex({ userId: 1 }, { unique: true });
    await db.collection('doctors').createIndex({ specialty: 1 });
    console.log('✓ Doctors indexes created');

    // Patients indexes
    await db.collection('patients').createIndex({ userId: 1 }, { unique: true });
    await db.collection('patients').createIndex({ assignedDoctorId: 1 });
    await db.collection('patients').createIndex({ hospitalId: 1 });
    console.log('✓ Patients indexes created');

    // Assignments indexes
    await db.collection('assignments').createIndex({ patientId: 1, createdAt: -1 });
    await db.collection('assignments').createIndex({ doctorId: 1, createdAt: -1 });
    console.log('✓ Assignments indexes created');

    // Prescriptions indexes
    await db.collection('prescriptions').createIndex({ patientId: 1, createdAt: -1 });
    await db.collection('prescriptions').createIndex({ doctorId: 1, createdAt: -1 });
    console.log('✓ Prescriptions indexes created');

    // Invoices indexes
    await db.collection('invoices').createIndex({ patientId: 1, issuedAt: -1 });
    await db.collection('invoices').createIndex({ status: 1 });
    console.log('✓ Invoices indexes created');

    // Vitals indexes
    await db.collection('vitals').createIndex({ 'meta.patientId': 1, timestamp: -1 });
    await db.collection('vitals').createIndex({ 'meta.deviceId': 1 });
    console.log('✓ Vitals indexes created');

    // ML Events indexes
    await db.collection('ml_events').createIndex({ patientId: 1, timestamp: -1 });
    await db.collection('ml_events').createIndex({ event: 1 });
    console.log('✓ ML Events indexes created');

    // Alerts indexes
    await db.collection('alerts').createIndex({ patientId: 1, createdAt: -1 });
    await db.collection('alerts').createIndex({ doctorId: 1, acknowledgedAt: 1 });
    await db.collection('alerts').createIndex({ severity: 1, createdAt: -1 });
    console.log('✓ Alerts indexes created');

    // Audit Logs indexes
    await db.collection('audit_logs').createIndex({ actorUserId: 1, createdAt: -1 });
    await db.collection('audit_logs').createIndex({ resource: 1, resourceId: 1 });
    console.log('✓ Audit Logs indexes created');

    console.log('\n✅ Database initialization complete!\n');
    console.log('Next steps:');
    console.log('1. Run: node seed-db-simple.js (to add sample data)');
    console.log('2. Start backend: cd ../backend && npm run dev\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

initializeDatabase();
