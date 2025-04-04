const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');

const verifyPassword = async () => {
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

    console.log('User found:', {
      email: user.email,
      status: user.status,
      passwordHash: user.password
    });

    // Test password verification
    const testPassword = 'password123';
    const isMatch = bcrypt.compareSync(testPassword, user.password);
    console.log(`\nPassword verification test:`);
    console.log(`Test password: ${testPassword}`);
    console.log(`Password matches: ${isMatch}`);

    // Try to update password directly
    console.log('\nUpdating password...');
    const salt = bcrypt.genSaltSync(10);
    user.password = bcrypt.hashSync(testPassword, salt);
    await user.save();
    console.log('Password updated successfully');

    // Verify again
    const updatedUser = await UserModel.findOne({ email: 'aryan123@gmail.com' });
    const verifyAgain = bcrypt.compareSync(testPassword, updatedUser.password);
    console.log('\nVerifying updated password:');
    console.log(`Password matches: ${verifyAgain}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
};

// Run the script
verifyPassword(); 