const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');

const checkUser = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/expensetracker');
    console.log('Successfully connected to MongoDB.');

    // Find the user
    const user = await UserModel.findOne({ email: 'aryan123@gmail.com' });
    if (!user) {
      console.log('User not found');
      return;
    }

    console.log('\nUser details:');
    console.log('Email:', user.email);
    console.log('Name:', user.firstName, user.lastName);
    console.log('Status:', user.status);
    console.log('Password hash:', user.password);

    // Test password verification
    const testPassword = 'password123';
    console.log('\nTesting password verification:');
    console.log('Test password:', testPassword);

    // Test using bcrypt directly
    const bcryptMatch = bcrypt.compareSync(testPassword, user.password);
    console.log('bcrypt.compareSync result:', bcryptMatch);

    // Test using model method
    const modelMatch = user.comparePassword(testPassword);
    console.log('model.comparePassword result:', modelMatch);

    // Test with wrong password
    const wrongPassword = 'wrongpassword';
    const wrongMatch = user.comparePassword(wrongPassword);
    console.log('\nTesting wrong password:', wrongMatch);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
};

// Run the script
checkUser(); 