const mongoose = require('mongoose');

const setupRoles = async () => {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect('mongodb://127.0.0.1:27017/expensetracker');
    console.log('Successfully connected to MongoDB.');

    // Define roles
    const roles = [
      { name: 'admin', description: 'Administrator' },
      { name: 'user', description: 'Regular User' }
    ];

    // Get the roles collection
    const rolesCollection = mongoose.connection.db.collection('roles');

    // Insert roles if they don't exist
    for (const role of roles) {
      const existingRole = await rolesCollection.findOne({ name: role.name });
      if (!existingRole) {
        await rolesCollection.insertOne(role);
        console.log(`Created role: ${role.name}`);
      } else {
        console.log(`Role already exists: ${role.name}`);
      }
    }

    // Display all roles
    const allRoles = await rolesCollection.find({}).toArray();
    console.log('\nRoles in database:');
    allRoles.forEach(role => {
      console.log(`- ${role._id}: ${role.name} (${role.description})`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB.');
  }
};

// Run the setup
setupRoles(); 