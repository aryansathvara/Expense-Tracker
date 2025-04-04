const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');

const resetUserPassword = async (email, newPassword = 'password123') => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/expensetracker');
    console.log('Successfully connected to MongoDB.');

    // Find the user
    const user = await UserModel.findOne({ email: email });
    if (!user) {
      console.log(`No user found with email: ${email}`);
      return;
    }

    // Hash the new password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);

    // Update the password
    user.password = hashedPassword;
    await user.save();

    console.log(`\nPassword reset successful for user: ${email}`);
    console.log('New login credentials:');
    console.log(`Email: ${email}`);
    console.log(`Password: ${newPassword}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
};

// Get email from command line arguments
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address.');
  console.log('Usage: node reset-user-password.js <email> [newPassword]');
  process.exit(1);
}

// Get optional password from command line arguments
const newPassword = process.argv[3] || 'password123';

// Run the script
resetUserPassword(email, newPassword); 