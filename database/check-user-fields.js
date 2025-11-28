require('dotenv').config({ path: '../backend/.env' });
const { MongoClient } = require('mongodb');

async function checkUserFields() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const user = await client.db('inhoz').collection('users').findOne({ email: 'dr.smith@inhoz.com' });
    
    console.log('Sample user fields:');
    console.log(JSON.stringify(user, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await client.close();
  }
}

checkUserFields();