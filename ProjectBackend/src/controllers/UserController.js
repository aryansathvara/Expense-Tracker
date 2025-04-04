const userModel = require("../models/UserModel")
const bcrypt = require("bcrypt");
const mailUtil = require("../utils/MailUtil");
const jwt = require("jsonwebtoken");

// Secret key for JWT - should be in environment variables in production
const secret = "your-secret-key-for-jwt-should-be-in-env-variables";

const loginUser = async(req,res) => {
  try {
    const { email, password } = req.body;
    console.log(`Login attempt - Email: ${email}, Password length: ${password ? password.length : 0}`);

    // Validate input
    if (!email || !password) {
      console.log('Login failed - Missing email or password');
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    // Special case for sarjan@gmail.com - known admin user
    if (email.toLowerCase() === "sarjan@gmail.com") {
      console.log("Special admin user (sarjan@gmail.com) login attempt");
      
      // Find user in DB first to validate password
      const adminUser = await userModel.findOne({ 
        email: { $regex: new RegExp(`^${email}$`, 'i') }
      });
      
      if (!adminUser) {
        console.log('Admin login failed - User not found');
        return res.status(401).json({
          message: "No account found with this email. Please check your email or sign up."
        });
      }
      
      // Check if admin user is active
      if (adminUser.status === false) {
        console.log('Admin login failed - User inactive');
        return res.status(401).json({
          message: "Account is inactive. Please contact administrator."
        });
      }
      
      // Verify password
      const isMatch = bcrypt.compareSync(password, adminUser.password);
      if (!isMatch) {
        console.log('Admin login failed - Password mismatch');
        return res.status(401).json({
          message: "Incorrect password. Please try again."
        });
      }
      
      // Find admin role (to get proper role ID)
      const adminRole = await require('../models/RoleModel').findOne({ name: "admin" });
      const adminRoleId = adminRole ? adminRole._id : "67c6825059581189a5ac0444"; // Use default if not found
      
      // Login successful - Force admin role
      console.log(`Admin login successful for ${email}`);
      
      // Return admin user data with admin role
      return res.status(201).json({
        message: "Login successful",
        data: {
          _id: adminUser._id,
          email: adminUser.email,
          firstName: adminUser.firstName,
          lastName: adminUser.lastName,
          roleId: {
            _id: adminRoleId,
            name: "admin"
          },
          status: adminUser.status
        }
      });
    }

    // Regular user login flow
    // Find user by email (case-insensitive) and populate role information
    const foundUser = await userModel.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    }).populate('roleId');
    
    console.log("Login attempt - User found:", foundUser ? {
      id: foundUser._id,
      email: foundUser.email,
      status: foundUser.status,
      role: foundUser.roleId?.name || 'user',
      passwordHash: foundUser.password.substring(0, 10) + '...'
    } : "No user found");
    
    // Check if user exists
    if (!foundUser) {
      console.log('Login failed - User not found');
      return res.status(401).json({
        message: "No account found with this email. Please check your email or sign up."
      });
    }

    // Check if user is active
    if (foundUser.status === false) {
      console.log('Login failed - User inactive');
      return res.status(401).json({
        message: "Account is inactive. Please contact administrator."
      });
    }

    // Check password match using bcrypt directly
    const isMatch = bcrypt.compareSync(password, foundUser.password);
    console.log(`Password verification result for ${email}: ${isMatch}`);
    
    if (!isMatch) {
      console.log('Login failed - Password mismatch');
      return res.status(401).json({
        message: "Incorrect password. Please try again."
      });
    }

    // Login successful
    console.log(`Login successful for ${email}`);
    
    // Format user data exactly as frontend expects
    const userData = {
      _id: foundUser._id,
      email: foundUser.email,
      firstName: foundUser.firstName,
      lastName: foundUser.lastName,
      roleId: {
        name: foundUser.roleId?.name || 'user'
      },
      status: foundUser.status
    };
    
    res.status(201).json({
      message: "Login successful",
      data: userData
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "An error occurred during login. Please try again.",
      error: error.message
    });
  }
};

  //try catch if else...
  const signup = async (req, res) => {
    console.log('Received signup request with data:', {
      ...req.body,
      password: req.body.password ? '[HIDDEN]' : undefined 
    });
    
    try {
      // Validate required fields
      const requiredFields = ['firstName', 'lastName', 'email', 'password'];
      const missingFields = requiredFields.filter(field => !req.body[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          message: `Missing required fields: ${missingFields.join(', ')}`,
        });
      }
      
      // Check if user with this email already exists
      const existingUser = await userModel.findOne({ email: req.body.email });
      if (existingUser) {
        return res.status(400).json({
          message: "Email already registered. Please use a different email or login.",
        });
      }

      // Hash the password
      const salt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(req.body.password, salt);
      
      // Prepare user data
      const userData = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: hashedPassword,
        age: req.body.age ? parseInt(req.body.age) : undefined,
        status: req.body.status !== undefined ? req.body.status : true,
        roleId: req.body.roleId || "67c6825059581189a5ac0444" // Default role if not provided
      };
      
      console.log("Creating user with data:", {
        ...userData,
        password: "[HIDDEN]" // Don't log the actual password
      });
      
      // Create the user
      const createdUser = await userModel.create(userData);
      console.log("User created successfully:", createdUser._id);

      // Try to send email, but don't fail the signup if email fails
      try {
        await mailUtil.sendingMail(
          createdUser.email,
          "Welcome to Expense Tracker",
          "Thank you for signing up with Expense Tracker!"
        );
        console.log("Welcome email sent successfully");
      } catch (emailError) {
        console.error("Failed to send welcome email:", emailError);
        // We continue with user creation even if email fails
      }

      // Return success response
      res.status(201).json({
        message: "User created successfully",
        data: createdUser,
      });

    } catch (err) {
      console.error("Error in signup:", err);
      
      // Handle MongoDB validation errors
      if (err.name === 'ValidationError') {
        const validationErrors = Object.keys(err.errors).reduce((acc, key) => {
          acc[key] = err.errors[key].message;
          return acc;
        }, {});
        
        return res.status(400).json({
          message: "Validation error",
          errors: validationErrors
        });
      }
      
      // Handle MongoDB duplicate key error
      if (err.code === 11000) {
        return res.status(400).json({
          message: "Email already exists",
        });
      }
      
      // For other errors
      res.status(500).json({
        message: "Error creating user",
        error: err.message || "Unknown error occurred",
      });
    }
  };

// Update user profile
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log(`Updating user profile for ID: ${userId}`);
    console.log('Update data:', {
      ...req.body,
      password: req.body.password ? '[HIDDEN]' : undefined
    });

    // Validate if user exists
    const existingUser = await userModel.findById(userId);
    if (!existingUser) {
      return res.status(404).json({
        message: "User not found"
      });
    }

    // Prepare update data
    const updateData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      phone: req.body.phone,
      address: req.body.address
    };

    // Only update fields that are actually provided
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });

    // Handle password update if provided
    if (req.body.password) {
      const salt = bcrypt.genSaltSync(10);
      updateData.password = bcrypt.hashSync(req.body.password, salt);
    }

    // Update the user
    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).populate("roleId");

    console.log("User updated successfully:", updatedUser._id);

    // Return success response
    res.status(200).json({
      message: "User profile updated successfully",
      data: updatedUser
    });
  } catch (err) {
    console.error("Error updating user profile:", err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.keys(err.errors).reduce((acc, key) => {
        acc[key] = err.errors[key].message;
        return acc;
      }, {});
      
      return res.status(400).json({
        message: "Validation error",
        errors: validationErrors
      });
    }
    
    // Handle MongoDB duplicate key error
    if (err.code === 11000) {
      return res.status(400).json({
        message: "Email already in use by another account",
      });
    }
    
    // For other errors
    res.status(500).json({
      message: "Error updating user profile",
      error: err.message || "Unknown error occurred",
    });
  }
};

const addUser = async (req, res) => {
  try {
    const savedUsers = await userModel.create(req.body);
    res.status(201).json({
      message: "User added successfully",
      data: savedUsers,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllUser = async (req, res) => {
  try {
    const savedUsers= await userModel.find().populate("roleId");
    res.status(201).json({
      message: "User added successfully",
      data: savedUsers,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


  const deleteUser = async(req,res)=>{

    
    const deletedUser = await userModel.findByIdAndDelete(req.params.id)

    res.json({
      message:"user deleted successfully..",
      data:deletedUser
    })

}

const forgotPassword = async (req, res) => {
  try {
    console.log("Received forgotPassword request for email:", req.body.email);
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        message: "Email is required.",
      });
    }

    // Use case-insensitive query to find the user
    const foundUser = await userModel.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });

    console.log("User found:", foundUser ? foundUser._id : "No user found");

    if (!foundUser) {
      return res.status(404).json({
        message: "User not found, please register first.",
      });
    }

    const token = jwt.sign(
      { _id: foundUser._id, email: foundUser.email },
      secret,
      { expiresIn: '15m' }
    );

    console.log("Generated token for password reset:", token);

    // Instead of hardcoding a port, use the origin from the request if available
    // This will work better with different development environments
    const origin = req.headers.origin || 'http://localhost:5175';
    const resetUrl = `${origin}/resetpassword/${token}`;
    
    // Fallback URLs for various common development ports
    const fallbackUrls = [
      `http://localhost:5173/resetpassword/${token}`,
      `http://localhost:5174/resetpassword/${token}`,
      `http://localhost:5175/resetpassword/${token}`
    ];
    
    console.log("Reset URL generated:", resetUrl);
    console.log("Fallback URLs:", fallbackUrls);

    const mailContent = `
      <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #ddd; background-color: #D0DDD0;">
        <h2 style="color: #AAB99A;">Reset Your Expense Tracker Password</h2>
        <p style="color: #555; font-size: 16px;">Hi ${foundUser.firstName} ${foundUser.lastName},</p>
        <p style="color: #555;">You recently requested to reset your password for your Expense Tracker account.</p>
        <p style="margin-top: 20px;">
          <a href="${resetUrl}" style="background-color: #AAB99A; color: white; padding: 10px 15px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        </p>
        <p style="color: #999; font-size: 14px;">If you didn't request a password reset, you can ignore this email.</p>
        <p style="color: #999; font-size: 14px;">This link will expire in 15 minutes.</p>
        <p style="color: #999; font-size: 14px;">If you're testing locally and the above link doesn't work, try these alternatives:</p>
        <ul style="color: #999; font-size: 14px;">
          ${fallbackUrls.map(url => `<li><a href="${url}">${url}</a></li>`).join('')}
        </ul>
      </div>
    `;

    try {
      // Try to send email
      const emailResult = await mailUtil.sendingMail(
        foundUser.email,
        foundUser.firstName,
        foundUser.lastName,
        "Reset Password Request",
        null,
        mailContent
      );

      console.log("Email sending result:", emailResult);
    } catch (emailError) {
      console.error("Email sending error caught:", emailError);
      // Continue execution even if email fails
    }

    // Always return success even if email fails, but include the token in the response for testing
    return res.status(200).json({
      message: "Reset password request processed. If the email doesn't arrive, please try again or contact support.",
      // Include both the main URL and fallbacks in the response for the frontend to use
      resetLink: resetUrl,
      fallbackLinks: fallbackUrls
    });

  } catch (error) {
    console.error("Forgot password error:", error);
    return res.status(500).json({
      message: "Something went wrong while processing your request.",
      error: error.message
    });
  }
};



const resetpassword = async (req, res) => {
  try {
    console.log("Received resetpassword request with token:", req.body.token ? "provided" : "missing");
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ 
        message: "Token and password are required." 
      });
    }

    let userFromToken;
    try {
      console.log("Attempting to verify token...");
      userFromToken = jwt.verify(token, secret);
      console.log("Token verified successfully. User ID:", userFromToken._id);
    } catch (err) {
      console.error("Token verification failed:", err.message);
      return res.status(400).json({ 
        message: "Invalid or expired token. Please request a new password reset.",
        error: err.message 
      });
    }

    const hashedPassword = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
    console.log("Password hashed, updating user...");

    const updatedUser = await userModel.findByIdAndUpdate(
      userFromToken._id,
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      console.error("User not found for ID:", userFromToken._id);
      return res.status(404).json({ message: "User not found." });
    }

    console.log("Password updated successfully for user:", updatedUser._id);
    res.status(200).json({ message: "Password updated successfully." });

  } catch (error) {
    console.error("Reset Password Error:", error);
    res.status(500).json({ 
      message: "Something went wrong during password reset.",
      error: error.message 
    });
  }
};

const getuserById = async (req,res)=>{

  
    const foundUser = await userModel.findById(req.params.id)
    res.json({
      message:"user fatched..",
      data:foundUser
    })
  
  }

// Add temporary test endpoint to reset password
const resetPasswordForTesting = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    
    if (!email || !newPassword) {
      return res.status(400).json({
        message: "Email and new password are required"
      });
    }
    
    // Find user by email (case-insensitive)
    const user = await userModel.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });
    
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    
    // Hash new password
    const salt = bcrypt.genSaltSync(10);
    const hashedPassword = bcrypt.hashSync(newPassword, salt);
    
    // Update user with new password
    user.password = hashedPassword;
    await user.save();
    
    console.log(`Password reset for ${email} - New password hash: ${hashedPassword.substring(0, 10)}...`);
    
    res.status(200).json({
      message: "Password reset successfully for testing"
    });
  } catch (error) {
    console.error("Error resetting password:", error);
    res.status(500).json({
      message: "Failed to reset password",
      error: error.message
    });
  }
};

// Add this function before the module.exports
const verifyLoginDetails = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Verify login attempt - Email:", email, "Password length:", password ? password.length : 0);

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
        details: { email: !!email, password: !!password }
      });
    }

    // Step 1: Check if user exists
    const foundUser = await userModel.findOne({ 
      email: { $regex: new RegExp(`^${email}$`, 'i') } 
    });
    
    if (!foundUser) {
      return res.status(404).json({
        message: "User not found",
        details: { email: email, exists: false }
      });
    }

    // User found, send information about the user without checking password
    console.log("User found with ID:", foundUser._id);
    
    // Step 2: Try password comparison but don't fail if it doesn't match
    const isMatch = bcrypt.compareSync(password, foundUser.password);
    console.log("Password comparison result:", isMatch);
    
    return res.status(200).json({
      message: "User found",
      details: {
        userId: foundUser._id,
        email: foundUser.email,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        passwordMatch: isMatch,
        passwordStoredLength: foundUser.password ? foundUser.password.length : 0,
        passwordProvidedLength: password ? password.length : 0
      }
    });
  } catch (error) {
    console.error("Error in verify login:", error);
    return res.status(500).json({
      message: "Error verifying login details",
      error: error.message
    });
  }
};

// Add a function to directly set a password with plain text
const setPlainPassword = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }
    
    const user = await userModel.findOne({ email: { $regex: new RegExp(`^${email}$`, 'i') } });
    if (!user) {
      return res.status(404).json({
        message: "User not found"
      });
    }
    
    // Set plain text password directly (for debugging only!)
    user.password = password;
    await user.save();
    
    return res.status(200).json({
      message: "Password set as plain text for debugging (not secure!)",
      userId: user._id
    });
  } catch (error) {
    console.error("Error setting plain password:", error);
    return res.status(500).json({
      message: "Error setting password",
      error: error.message
    });
  }
};

module.exports = {
  loginUser,
  signup,
  addUser,
  getAllUser,
  deleteUser,
  updateUser,
  getuserById,
  forgotPassword,
  resetpassword,
  resetPasswordForTesting,
  verifyLoginDetails,
  setPlainPassword
};

