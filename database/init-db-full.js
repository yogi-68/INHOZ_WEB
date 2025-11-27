require('dotenv').config({ path: '../backend/.env' });
const { MongoClient } = require('mongodb');

async function initializeDatabase() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in backend/.env file');
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
        expireAfterSeconds: 31536000 // 1 year retention
      });
      console.log('✓ Time-series collection "vitals" created');
    } catch (e) {
      if (e.code === 48) console.log('⚠ Collection "vitals" already exists');
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
        if (e.code === 48) console.log(`⚠ Collection "${collName}" already exists`);
      }
    }

    console.log('\n=== Creating Indexes ===\n');

    // Users indexes
    await db.collection('users').createIndexes([
      { key: { email: 1 }, unique: true },
      { key: { role: 1 } },
      { key: { deletedAt: 1 } }
    ]);
    console.log('✓ Users indexes created');

    // Doctors indexes
    await db.collection('doctors').createIndexes([
      { key: { userId: 1 }, unique: true },
      { key: { specialty: 1 } },
      { key: { deletedAt: 1 } }
    ]);
    console.log('✓ Doctors indexes created');

    // Patients indexes
    await db.collection('patients').createIndexes([
      { key: { userId: 1 }, unique: true },
      { key: { assignedDoctorId: 1 } },
      { key: { hospitalId: 1 } },
      { key: { status: 1 } },
      { key: { deletedAt: 1 } }
    ]);
    console.log('✓ Patients indexes created');

    // Assignments indexes
    await db.collection('assignments').createIndexes([
      { key: { patientId: 1, createdAt: -1 } },
      { key: { doctorId: 1, createdAt: -1 } },
      { key: { from: 1, to: 1 } }
    ]);
    console.log('✓ Assignments indexes created');

    // Prescriptions indexes
    await db.collection('prescriptions').createIndexes([
      { key: { patientId: 1, createdAt: -1 } },
      { key: { doctorId: 1, createdAt: -1 } },
      { key: { validFrom: 1, validUntil: 1 } }
    ]);
    console.log('✓ Prescriptions indexes created');

    // Invoices indexes
    await db.collection('invoices').createIndexes([
      { key: { patientId: 1, issuedAt: -1 } },
      { key: { status: 1 } },
      { key: { dueAt: 1 } }
    ]);
    console.log('✓ Invoices indexes created');

    // Vitals indexes (time-series optimized)
    await db.collection('vitals').createIndexes([
      { key: { 'meta.patientId': 1, timestamp: -1 } },
      { key: { 'meta.deviceId': 1 } }
    ]);
    console.log('✓ Vitals indexes created');

    // ML Events indexes
    await db.collection('ml_events').createIndexes([
      { key: { patientId: 1, timestamp: -1 } },
      { key: { event: 1 } },
      { key: { deviceId: 1 } }
    ]);
    console.log('✓ ML Events indexes created');

    // Alerts indexes
    await db.collection('alerts').createIndexes([
      { key: { patientId: 1, createdAt: -1 } },
      { key: { doctorId: 1, acknowledgedAt: 1 } },
      { key: { severity: 1, createdAt: -1 } },
      { key: { type: 1 } },
      { key: { source: 1 } }
    ]);
    console.log('✓ Alerts indexes created');

    // Audit Logs indexes
    await db.collection('audit_logs').createIndexes([
      { key: { actorUserId: 1, createdAt: -1 } },
      { key: { resource: 1, resourceId: 1 } },
      { key: { createdAt: -1 } }
    ]);
    console.log('✓ Audit Logs indexes created');

    console.log('\n✅ Database initialization complete!\n');
    console.log('Next steps:');
    console.log('1. Run: node seed-data-full.js (to add comprehensive sample data)');
    console.log('2. Start backend: cd ../backend && npm run dev\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

initializeDatabase();
