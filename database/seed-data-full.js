require('dotenv').config({ path: '../backend/.env' });
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found');
    process.exit(1);
  }

  console.log('🔄 Connecting to MongoDB Atlas...\n');
  
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('✅ Connected!\n');

    const db = client.db('inhoz');

    // Hash passwords
    const adminPassword = await bcrypt.hash('admin123', 10);
    const doctorPassword = await bcrypt.hash('doctor123', 10);
    const patientPassword = await bcrypt.hash('patient123', 10);

    console.log('=== Creating Users ===\n');

    // Admin user
    const adminId = new ObjectId();
    await db.collection('users').insertOne({
      _id: adminId,
      email: 'admin@inhoz.com',
      passwordHash: adminPassword,
      role: 'admin',
      profile: {
        firstName: 'Admin',
        lastName: 'User',
        phone: '+1234567890',
        avatarUrl: null
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    });
    console.log('✓ Admin user created (admin@inhoz.com / admin123)');

    // Doctor 1
    const doctor1UserId = new ObjectId();
    const doctor1Id = new ObjectId();
    await db.collection('users').insertOne({
      _id: doctor1UserId,
      email: 'dr.smith@inhoz.com',
      passwordHash: doctorPassword,
      role: 'doctor',
      profile: {
        firstName: 'John',
        lastName: 'Smith',
        phone: '+1234567891',
        avatarUrl: null
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    });
    
    await db.collection('doctors').insertOne({
      _id: doctor1Id,
      userId: doctor1UserId,
      specialty: 'Cardiology',
      credentials: ['MD', 'FACC'],
      availability: [
        { day: 'Monday', from: '09:00', to: '17:00' },
        { day: 'Wednesday', from: '09:00', to: '17:00' },
        { day: 'Friday', from: '09:00', to: '17:00' }
      ],
      assignedPatients: [],
      createdAt: new Date(),
      deletedAt: null
    });
    console.log('✓ Doctor 1 created (dr.smith@inhoz.com / doctor123)');

    // Doctor 2
    const doctor2UserId = new ObjectId();
    const doctor2Id = new ObjectId();
    await db.collection('users').insertOne({
      _id: doctor2UserId,
      email: 'dr.jones@inhoz.com',
      passwordHash: doctorPassword,
      role: 'doctor',
      profile: {
        firstName: 'Sarah',
        lastName: 'Jones',
        phone: '+1987654321',
        avatarUrl: null
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    });
    
    await db.collection('doctors').insertOne({
      _id: doctor2Id,
      userId: doctor2UserId,
      specialty: 'Neurology',
      credentials: ['MD', 'PhD'],
      availability: [
        { day: 'Tuesday', from: '08:00', to: '16:00' },
        { day: 'Thursday', from: '08:00', to: '16:00' }
      ],
      assignedPatients: [],
      createdAt: new Date(),
      deletedAt: null
    });
    console.log('✓ Doctor 2 created (dr.jones@inhoz.com / doctor123)');

    console.log('\n=== Creating Patients ===\n');

    // Patient 1
    const patient1UserId = new ObjectId();
    const patient1Id = new ObjectId();
    await db.collection('users').insertOne({
      _id: patient1UserId,
      email: 'john.doe@example.com',
      passwordHash: patientPassword,
      role: 'patient',
      profile: {
        firstName: 'John',
        lastName: 'Doe',
        phone: '+1234567892',
        avatarUrl: null
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    });
    
    await db.collection('patients').insertOne({
      _id: patient1Id,
      userId: patient1UserId,
      hospitalId: 'H-001',
      roomNo: '301A',
      age: 65,
      gender: 'M',
      emergencyContact: {
        name: 'Jane Doe',
        phone: '+1234567893'
      },
      status: 'monitoring',
      assignedDoctorId: doctor1Id,
      createdAt: new Date(),
      deletedAt: null
    });
    console.log('✓ Patient 1 created (john.doe@example.com / patient123)');

    // Patient 2
    const patient2UserId = new ObjectId();
    const patient2Id = new ObjectId();
    await db.collection('users').insertOne({
      _id: patient2UserId,
      email: 'mary.wilson@example.com',
      passwordHash: patientPassword,
      role: 'patient',
      profile: {
        firstName: 'Mary',
        lastName: 'Wilson',
        phone: '+1987654322',
        avatarUrl: null
      },
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      deletedAt: null
    });
    
    await db.collection('patients').insertOne({
      _id: patient2Id,
      userId: patient2UserId,
      hospitalId: 'H-002',
      roomNo: '302B',
      age: 72,
      gender: 'F',
      emergencyContact: {
        name: 'Tom Wilson',
        phone: '+1987654323'
      },
      status: 'monitoring',
      assignedDoctorId: doctor2Id,
      createdAt: new Date(),
      deletedAt: null
    });
    console.log('✓ Patient 2 created (mary.wilson@example.com / patient123)');

    // Update doctors' assignedPatients
    await db.collection('doctors').updateOne(
      { _id: doctor1Id },
      { $push: { assignedPatients: patient1Id } }
    );
    await db.collection('doctors').updateOne(
      { _id: doctor2Id },
      { $push: { assignedPatients: patient2Id } }
    );

    console.log('\n=== Creating Assignments ===\n');

    // Assignment records (audit trail)
    await db.collection('assignments').insertMany([
      {
        _id: new ObjectId(),
        patientId: patient1Id,
        doctorId: doctor1Id,
        assignedBy: adminId,
        from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        to: null,
        notes: 'Initial assignment for cardiac monitoring',
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        patientId: patient2Id,
        doctorId: doctor2Id,
        assignedBy: adminId,
        from: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
        to: null,
        notes: 'Post-stroke rehabilitation monitoring',
        createdAt: new Date()
      }
    ]);
    console.log('✓ Assignment records created');

    console.log('\n=== Creating Sample Vitals Data ===\n');

    // Generate 48 hours of vitals for patient 1
    const vitals = [];
    const now = Date.now();
    for (let i = 0; i < 48; i++) {
      vitals.push({
        meta: {
          patientId: patient1Id.toString(),
          deviceId: 'DEVICE-001'
        },
        timestamp: new Date(now - i * 60 * 60 * 1000),
        heartRate: 70 + Math.floor(Math.random() * 20),
        bloodPressure: {
          systolic: 120 + Math.floor(Math.random() * 20),
          diastolic: 80 + Math.floor(Math.random() * 10)
        },
        temperature: 36.5 + Math.random() * 1.5,
        spO2: 95 + Math.floor(Math.random() * 5),
        respiratoryRate: 16 + Math.floor(Math.random() * 6),
        ivLevel: 500 - (i * 10),
        glucose: 90 + Math.floor(Math.random() * 20),
        painScale: Math.floor(Math.random() * 3)
      });
    }
    await db.collection('vitals').insertMany(vitals);
    console.log(`✓ Created 48 vitals records for Patient 1`);

    console.log('\n=== Creating Prescriptions ===\n');

    await db.collection('prescriptions').insertMany([
      {
        _id: new ObjectId(),
        patientId: patient1Id,
        doctorId: doctor1Id,
        medicines: [
          { name: 'Lisinopril', dose: '10mg', frequency: 'Once daily', durationDays: 30 },
          { name: 'Aspirin', dose: '81mg', frequency: 'Once daily', durationDays: 30 }
        ],
        tests: ['ECG', 'Blood Pressure Monitoring'],
        notes: 'Monitor blood pressure regularly',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        attachments: [],
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        patientId: patient2Id,
        doctorId: doctor2Id,
        medicines: [
          { name: 'Clopidogrel', dose: '75mg', frequency: 'Once daily', durationDays: 90 },
          { name: 'Atorvastatin', dose: '40mg', frequency: 'Once daily at bedtime', durationDays: 90 }
        ],
        tests: ['MRI', 'Physical Therapy Assessment'],
        notes: 'Continue physical therapy sessions',
        validFrom: new Date(),
        validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        attachments: [],
        createdAt: new Date()
      }
    ]);
    console.log('✓ Prescriptions created');

    console.log('\n=== Creating Invoices ===\n');

    await db.collection('invoices').insertMany([
      {
        _id: new ObjectId(),
        patientId: patient1Id,
        items: [
          { label: 'Room charges (7 days)', amount: 3500 },
          { label: 'Doctor consultation', amount: 600 },
          { label: 'Medication', amount: 150 },
          { label: 'Lab tests', amount: 250 }
        ],
        total: 4500,
        issuedBy: adminId,
        status: 'pending',
        issuedAt: new Date(),
        dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        attachmentUrl: null,
        createdAt: new Date()
      },
      {
        _id: new ObjectId(),
        patientId: patient2Id,
        items: [
          { label: 'Room charges (3 days)', amount: 1500 },
          { label: 'Neurologist consultation', amount: 800 },
          { label: 'MRI Scan', amount: 1200 },
          { label: 'Physical therapy (5 sessions)', amount: 500 }
        ],
        total: 4000,
        issuedBy: adminId,
        status: 'pending',
        issuedAt: new Date(),
        dueAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        attachmentUrl: null,
        createdAt: new Date()
      }
    ]);
    console.log('✓ Invoices created');

    console.log('\n=== Creating Sample ML Events ===\n');

    await db.collection('ml_events').insertMany([
      {
        _id: new ObjectId(),
        patientId: patient1Id,
        deviceId: 'CAM-001',
        event: 'irregular_breathing',
        confidence: 0.78,
        frameUrl: null,
        metadata: { modelVersion: 'v1.2.3' },
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
      },
      {
        _id: new ObjectId(),
        patientId: patient2Id,
        deviceId: 'CAM-002',
        event: 'no_movement',
        confidence: 0.82,
        frameUrl: null,
        metadata: { modelVersion: 'v1.2.3', durationMinutes: 12 },
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
      }
    ]);
    console.log('✓ ML events created');

    console.log('\n=== Creating Sample Alerts ===\n');

    await db.collection('alerts').insertMany([
      {
        _id: new ObjectId(),
        patientId: patient1Id,
        type: 'TACHYCARDIA',
        source: 'sensor',
        severity: 'warning',
        message: 'Heart rate elevated: 125 bpm',
        vitalSnapshot: {
          heartRate: 125,
          timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000)
        },
        mlConfidence: null,
        doctorId: doctor1Id,
        createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        acknowledgedBy: null,
        acknowledgedAt: null
      },
      {
        _id: new ObjectId(),
        patientId: patient2Id,
        type: 'NO_MOVEMENT',
        source: 'ml',
        severity: 'warning',
        message: 'No significant movement detected for 12 minutes',
        vitalSnapshot: null,
        mlConfidence: 0.82,
        doctorId: doctor2Id,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        acknowledgedBy: doctor2Id,
        acknowledgedAt: new Date(Date.now() - 15 * 60 * 1000)
      }
    ]);
    console.log('✓ Alerts created');

    console.log('\n=== Creating Audit Logs ===\n');

    await db.collection('audit_logs').insertMany([
      {
        _id: new ObjectId(),
        actorUserId: adminId,
        actorRole: 'admin',
        action: 'ASSIGN_PATIENT',
        resource: 'assignments',
        resourceId: patient1Id,
        before: null,
        after: { patientId: patient1Id, doctorId: doctor1Id },
        ip: '127.0.0.1',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        _id: new ObjectId(),
        actorUserId: adminId,
        actorRole: 'admin',
        action: 'CREATE_INVOICE',
        resource: 'invoices',
        resourceId: patient1Id,
        before: null,
        after: { total: 4500, status: 'pending' },
        ip: '127.0.0.1',
        createdAt: new Date()
      }
    ]);
    console.log('✓ Audit logs created');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('=== Test Credentials ===');
    console.log('Admin:     admin@inhoz.com / admin123');
    console.log('Doctor 1:  dr.smith@inhoz.com / doctor123');
    console.log('Doctor 2:  dr.jones@inhoz.com / doctor123');
    console.log('Patient 1: john.doe@example.com / patient123');
    console.log('Patient 2: mary.wilson@example.com / patient123\n');
    console.log('Next step: cd ../backend && npm run dev\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedDatabase();
