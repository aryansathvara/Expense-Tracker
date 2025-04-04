const mongoose = require('mongoose');

const updateAdminRole = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/expensetracker');
    console.log('Successfully connected to MongoDB.');

    const db = mongoose.connection.db;

    // First ensure admin role exists
    const rolesCollection = db.collection('roles');
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

    console.log('Admin role:', adminRole);

    // Update user's role
    const usersCollection = db.collection('users');
    const result = await usersCollection.updateOne(
      { email: 'sarjan@gmail.com' },
      { $set: { roleId: adminRole._id } }
    );

    if (result.matchedCount === 0) {
      console.log('User sarjan@gmail.com not found');
    } else if (result.modifiedCount === 0) {
      console.log('User already has admin role');
    } else {
      console.log('Successfully updated user role to admin');
    }

    // Verify the update
    const user = await usersCollection.findOne({ email: 'sarjan@gmail.com' });
    console.log('\nUser details:');
    console.log('- Email:', user.email);
    console.log('- Role ID:', user.roleId);
    console.log('- Name:', user.firstName, user.lastName);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
};

updateAdminRole(); 