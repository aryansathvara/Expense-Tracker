const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');

const fixAllUsers = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/expensetracker');
    console.log('Successfully connected to MongoDB.');

    // Get all users
    const users = await UserModel.find({});
    console.log(`Found ${users.length} users to process.`);

    // Process each user
    for (const user of users) {
      try {
        console.log(`\nProcessing user: ${user.email}`);
        
        // Set a default password based on their email
        const defaultPassword = user.email.split('@')[0] + '123';
        
        // Hash the password
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(defaultPassword, salt);
        
        // Update user with hashed password
        user.password = hashedPassword;
        await user.save();
        
        console.log(`Password reset for ${user.email}`);
        console.log('New login credentials:');
        console.log('Email:', user.email);
        console.log('Password:', defaultPassword);
        
        // Verify the password works
        const passwordMatch = bcrypt.compareSync(defaultPassword, user.password);
        console.log('Password verification:', passwordMatch ? 'Success' : 'Failed');
        
      } catch (userError) {
        console.error(`Error processing user ${user.email}:`, userError);
      }
    }

    console.log('\nAll users processed.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
};

// Run the script
fixAllUsers(); 