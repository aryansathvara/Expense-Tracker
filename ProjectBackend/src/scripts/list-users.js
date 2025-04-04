const mongoose = require('mongoose');
const UserModel = require('../models/UserModel');

const listUsers = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/expensetracker');
    console.log('Successfully connected to MongoDB.');

    // Get all users
    const users = await UserModel.find({})
      .select('email firstName lastName status');

    // Get roles collection
    const rolesCollection = mongoose.connection.db.collection('roles');

    console.log('\nUsers in database:');
    if (users.length === 0) {
      console.log('No users found.');
    } else {
      for (const user of users) {
        console.log(`- ${user.email} (${user.firstName} ${user.lastName})`);
        console.log(`  Status: ${user.status ? 'Active' : 'Inactive'}`);
        
        // Get role if it exists
        if (user.roleId) {
          try {
            const role = await rolesCollection.findOne({ _id: user.roleId });
            console.log(`  Role: ${role ? role.name : 'No role assigned'}`);
          } catch (e) {
            console.log('  Role: No role assigned');
          }
        } else {
          console.log('  Role: No role assigned');
        }
        console.log('');
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
};

// Run the script
listUsers(); 