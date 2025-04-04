const mongoose = require('mongoose');
const UserModel = require('../models/UserModel');

const checkDatabase = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/expensetracker');
    console.log('Successfully connected to MongoDB.');

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nCollections in database:');
    collections.forEach(collection => {
      console.log(`- ${collection.name}`);
    });

    // Get all users
    const users = await UserModel.find({}).select('email firstName lastName status');
    console.log('\nUsers in database:');
    if (users.length === 0) {
      console.log('No users found in the database.');
    } else {
      users.forEach(user => {
        console.log(`- ${user.email} (${user.firstName} ${user.lastName}) - Status: ${user.status}`);
      });
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
};

// Run the check
checkDatabase(); 