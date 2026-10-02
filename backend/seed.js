/**
 * Optional helper script to create a default Admin account for first login.
 * Run with: npm run seed
 */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');

const run = async () => {
  await connectDB();

  const email = 'admin@crs.edu';
  const existing = await User.findOne({ email });

  if (existing) {
    console.log(`Admin account already exists: ${email}`);
  } else {
    await User.create({
      name: 'System Admin',
      email,
      password: 'Admin@123',
      role: 'Admin',
    });
    console.log('Default Admin account created:');
    console.log(`  email:    ${email}`);
    console.log('  password: Admin@123');
  }

  await mongoose.connection.close();
  process.exit(0);
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
