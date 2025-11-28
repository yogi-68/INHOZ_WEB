require('dotenv').config({ path: '../backend/.env' });
const { MongoClient } = require('mongodb');

async function checkUsers() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const users = await client.db('inhoz').collection('users').find({}).toArray();
    
    console.log('=== Existing Users ===');
    users.forEach(u => {
      console.log(`Email: ${u.email}`);
      console.log(`Role: ${u.role}`);
      console.log(`Has Password: ${!!(u.passwordHash || u.password)}`);
      console.log(`Active: ${u.isActive !== false}`);
      console.log('---');
    });
    
    console.log(`Total users: ${users.length}\n`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

checkUsers();