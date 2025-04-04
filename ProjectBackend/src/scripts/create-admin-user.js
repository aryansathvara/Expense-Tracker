const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const UserModel = require('../models/UserModel');

const createAdminUser = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/expensetracker');
    console.log('Successfully connected to MongoDB.');

    // First ensure admin role exists
    const rolesCollection = mongoose.connection.db.collection('roles');
    let adminRole = await rolesCollection.findOne({ name: 'admin' });
    
    if (!adminRole) {
      console.log('Creating admin role...');
      const result = await rolesCollection.insertOne({
        name: 'admin',
        description: 'Administrator'
      });
      adminRole = await rolesCollection.findOne({ _id: result.insertedId });
      console.log('Admin role created successfully');
    }

    console.log('Admin role found:', adminRole);

    // Create admin user data
    const adminData = {
      firstName: 'Sarjan',
      lastName: 'Admin',
      email: 'sarjan@gmail.com',
      password: 'sarjan123',
      status: true,
      roleId: adminRole._id, // Use the admin role ID
      phone: '9876543210',
      address: 'Admin Address'
    };

    // Hash the password
    const salt = bcrypt.genSaltSync(10);
    adminData.password = bcrypt.hashSync(adminData.password, salt);

    // Check if user already exists
    const existingUser = await UserModel.findOne({ email: adminData.email });
    if (existingUser) {
      console.log('Admin user exists. Updating role and password...');
      existingUser.roleId = adminRole._id; // Ensure role is set to admin
      existingUser.password = adminData.password;
      await existingUser.save();
      console.log('Admin user updated successfully.');
    } else {
      // Create new admin user
      const user = new UserModel(adminData);
      await user.save();
      console.log('Admin user created successfully.');
    }

    // Verify the user exists with populated role
    const verifyUser = await UserModel.findOne({ email: adminData.email })
      .populate('roleId')
      .select('email firstName lastName status roleId');
      
    console.log('\nAdmin user in database:');
    console.log(`- ${verifyUser.email} (${verifyUser.firstName} ${verifyUser.lastName})`);
    console.log(`- Role: ${verifyUser.roleId?.name || 'Unknown'}`);
    console.log(`- Status: ${verifyUser.status}`);
    console.log('\nLogin credentials:');
    console.log('Email: sarjan@gmail.com');
    console.log('Password: sarjan123');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
};

createAdminUser(); 