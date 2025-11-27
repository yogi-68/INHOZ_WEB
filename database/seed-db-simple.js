require('dotenv').config({ path: '../backend/.env' });
const { MongoClient, ObjectId } = require('mongodb');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  const uri = process.env.MONGODB_URI;
  
  if (!uri) {
    console.error('❌ MONGODB_URI not found in backend/.env file');
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
      password: adminPassword,
      role: 'admin',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✓ Admin user created (admin@inhoz.com / admin123)');

    // Doctor 1
    const doctor1UserId = new ObjectId();
    const doctor1Id = new ObjectId();
    await db.collection('users').insertOne({
      _id: doctor1UserId,
      email: 'dr.smith@inhoz.com',
      password: doctorPassword,
      role: 'doctor',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await db.collection('doctors').insertOne({
      _id: doctor1Id,
      userId: doctor1UserId,
      name: 'Dr. John Smith',
      specialty: 'Cardiology',
      licenseNumber: 'MD-12345',
      phone: '+1234567890',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✓ Doctor 1 created (dr.smith@inhoz.com / doctor123)');

    // Doctor 2
    const doctor2UserId = new ObjectId();
    const doctor2Id = new ObjectId();
    await db.collection('users').insertOne({
      _id: doctor2UserId,
      email: 'dr.jones@inhoz.com',
      password: doctorPassword,
      role: 'doctor',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await db.collection('doctors').insertOne({
      _id: doctor2Id,
      userId: doctor2UserId,
      name: 'Dr. Sarah Jones',
      specialty: 'Neurology',
      licenseNumber: 'MD-67890',
      phone: '+1987654321',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✓ Doctor 2 created (dr.jones@inhoz.com / doctor123)');

    console.log('\n=== Creating Patients ===\n');

    // Patient 1
    const patient1UserId = new ObjectId();
    const patient1Id = new ObjectId();
    await db.collection('users').insertOne({
      _id: patient1UserId,
      email: 'john.doe@example.com',
      password: patientPassword,
      role: 'patient',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await db.collection('patients').insertOne({
      _id: patient1Id,
      userId: patient1UserId,
      name: 'John Doe',
      age: 65,
      gender: 'male',
      hospitalId: 'H-001',
      roomNumber: '301',
      bedNumber: 'A',
      assignedDoctorId: doctor1Id,
      admissionDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      diagnosis: 'Hypertension',
      emergencyContact: { name: 'Jane Doe', relationship: 'Spouse', phone: '+1234567891' },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✓ Patient 1 created (john.doe@example.com / patient123)');

    // Patient 2
    const patient2UserId = new ObjectId();
    const patient2Id = new ObjectId();
    await db.collection('users').insertOne({
      _id: patient2UserId,
      email: 'mary.wilson@example.com',
      password: patientPassword,
      role: 'patient',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    await db.collection('patients').insertOne({
      _id: patient2Id,
      userId: patient2UserId,
      name: 'Mary Wilson',
      age: 72,
      gender: 'female',
      hospitalId: 'H-002',
      roomNumber: '302',
      bedNumber: 'B',
      assignedDoctorId: doctor2Id,
      admissionDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      diagnosis: 'Post-stroke rehabilitation',
      emergencyContact: { name: 'Tom Wilson', relationship: 'Son', phone: '+1987654322' },
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✓ Patient 2 created (mary.wilson@example.com / patient123)');

    console.log('\n=== Creating Sample Vitals Data ===\n');

    // Generate 24 hours of vitals for patient 1
    const now = Date.now();
    const vitals = [];
    for (let i = 0; i < 24; i++) {
      vitals.push({
        timestamp: new Date(now - i * 60 * 60 * 1000),
        meta: {
          patientId: patient1Id.toString(),
          deviceId: 'DEVICE-001'
        },
        heartRate: 70 + Math.floor(Math.random() * 20),
        spo2: 95 + Math.floor(Math.random() * 5),
        temperature: 36.5 + Math.random() * 1.5,
        systolic: 120 + Math.floor(Math.random() * 20),
        diastolic: 80 + Math.floor(Math.random() * 10),
        respiratoryRate: 16 + Math.floor(Math.random() * 6)
      });
    }
    await db.collection('vitals').insertMany(vitals);
    console.log(`✓ Created 24 vitals records for Patient 1`);

    console.log('\n=== Creating Prescription ===\n');

    await db.collection('prescriptions').insertOne({
      patientId: patient1Id,
      doctorId: doctor1Id,
      medications: [
        { name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', duration: '30 days' },
        { name: 'Aspirin', dosage: '81mg', frequency: 'Once daily', duration: '30 days' }
      ],
      notes: 'Monitor blood pressure regularly',
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✓ Prescription created');

    console.log('\n=== Creating Invoice ===\n');

    await db.collection('invoices').insertOne({
      patientId: patient1Id,
      items: [
        { description: 'Room charges', quantity: 7, unitPrice: 500, total: 3500 },
        { description: 'Doctor consultation', quantity: 3, unitPrice: 200, total: 600 },
        { description: 'Medication', quantity: 1, unitPrice: 150, total: 150 }
      ],
      subtotal: 4250,
      tax: 425,
      total: 4675,
      status: 'pending',
      issuedAt: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    });
    console.log('✓ Invoice created');

    console.log('\n✅ Database seeded successfully!\n');
    console.log('=== Test Credentials ===');
    console.log('Admin:    admin@inhoz.com / admin123');
    console.log('Doctor 1: dr.smith@inhoz.com / doctor123');
    console.log('Doctor 2: dr.jones@inhoz.com / doctor123');
    console.log('Patient 1: john.doe@example.com / patient123');
    console.log('Patient 2: mary.wilson@example.com / patient123\n');
    console.log('Next step: cd ../backend && npm run dev\n');

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
  }
}

seedDatabase();
