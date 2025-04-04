const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');

const resetAllPasswords = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/expensetracker');
    console.log('Successfully connected to MongoDB.');

    // Get all users
    const users = await UserModel.find({});
    console.log(`Found ${users.length} users`);

    // Reset each user's password
    for (const user of users) {
      // Generate new salt and hash
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync('password123', salt);

      // Update user directly in database to bypass pre-save hook
      await UserModel.updateOne(
        { _id: user._id },
        { $set: { password: hashedPassword } }
      );

      console.log(`Reset password for user: ${user.email}`);
    }

    // Verify the passwords
    console.log('\nVerifying passwords...');
    for (const user of users) {
      const updatedUser = await UserModel.findById(user._id);
      const isMatch = bcrypt.compareSync('password123', updatedUser.password);
      console.log(`${user.email}: Password verification ${isMatch ? 'successful' : 'failed'}`);
    }

    console.log('\nAll passwords have been reset to: password123');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
};

// Run the script
resetAllPasswords(); 