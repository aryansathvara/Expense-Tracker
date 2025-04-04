const mongoose = require("mongoose")
const bcrypt = require("bcrypt");
const Schema = mongoose.Schema;
const userSchema = new Schema({

    firstName:{
        type:String
    },
    lastName:{
        type:String
    },
    age:{
        type:Number
    },
    status:{
        type:Boolean
    },
    roleId:{
        type:Schema.Types.ObjectId,
        ref:"roles"
    },
    password:{
        type:String,
        required: true
    },
    email:{
        type:String,
        required: true
    },
    phone:{
        type:String,
    },
    address:{
        type:String,
    }

},{timestamps: true})

// Add pre-save hook to hash passwords
userSchema.pre('save', function(next) {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified('password')) return next();
    
    try {
        // Check if the password is already hashed
        if (this.password.startsWith('$2b$') || this.password.startsWith('$2a$')) {
            return next();
        }
        
        // Generate a salt
        const salt = bcrypt.genSaltSync(10);
        
        // Hash the password using the new salt
        this.password = bcrypt.hashSync(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Add method to verify password
userSchema.methods.comparePassword = function(candidatePassword) {
    try {
        return bcrypt.compareSync(candidatePassword, this.password);
    } catch (error) {
        console.error('Password comparison error:', error);
        return false;
    }
};

module.exports = mongoose.model("user",userSchema)

