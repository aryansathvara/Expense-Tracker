const IncomeModel = require("../models/IncomeModel")
const mongoose = require("mongoose")

const addIncome = async (req, res) => {
  try {
    console.log("Attempting to add income with data:", req.body);
    
    // Make a copy of the request body to modify if needed
    const incomeData = { ...req.body };
    
    // Ensure status is a string and default to 'completed'
    if (!incomeData.status || incomeData.status === '') {
      incomeData.status = 'completed';
    } else if (typeof incomeData.status === 'object') {
      console.warn("Income status is an object, converting to string:", incomeData.status);
      // Try to extract from enum if available
      if (incomeData.status.enum && Array.isArray(incomeData.status.enum) && incomeData.status.enum.length > 0) {
        incomeData.status = incomeData.status.enum[0];
      } else {
        // Default to completed
        incomeData.status = 'completed';
      }
    }
    
    // Ensure amount is a proper number
    if (incomeData.amount) {
      incomeData.amount = parseFloat(incomeData.amount);
      console.log("Converted amount to number:", incomeData.amount);
    }
    
    // Create a new income document with fixed data
    const income = new IncomeModel(incomeData);
    
    // Save the income document
    const savedIncome = await income.save();
    
    console.log("Income saved successfully:", savedIncome);
    
    res.status(201).json({
      message: "Income added successfully",
      data: savedIncome
    });
  } catch (err) {
    console.error("Error adding income:", err);
    
    // Check for duplicate key error
    if (err.code === 11000) {
      console.error("Duplicate key error details:", err.keyValue);
      
      return res.status(400).json({ 
        message: "Duplicate key error. You cannot add multiple incomes with the same account ID.",
        error: err.message,
        keyValue: err.keyValue
      });
    }
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(error => error.message);
      return res.status(400).json({ 
        message: "Validation error", 
        errors: validationErrors 
      });
    }
    
    // Generic error
    res.status(500).json({ 
      message: "Failed to add income", 
      error: err.message 
    });
  }
};

const getAllIncome = async (req, res) => {
  try {
    // Add optional filtering by userId if provided
    let query = {};
    if (req.query.userId) {
      query.userId = req.query.userId;
    }
    
    const Income = await IncomeModel.find(query)
      .populate("accountId userId")
      .sort({ transcationDate: -1 }); // Sort by date, newest first
      
    res.status(200).json({
      message: "Incomes retrieved successfully",
      data: Income
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get income by ID
const getIncomeById = async (req, res) => {
  try {
    const income = await IncomeModel.findById(req.params.id)
      .populate("accountId userId");
      
    if (!income) {
      return res.status(404).json({ message: "Income not found" });
    }
    
    res.status(200).json({
      message: "Income retrieved successfully",
      data: income
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Update income
const updateIncome = async (req, res) => {
  try {
    // Make a copy of the request body to modify if needed
    const incomeData = { ...req.body };
    
    // Ensure status is a string and default to 'completed'
    if (!incomeData.status || incomeData.status === '') {
      incomeData.status = 'completed';
    } else if (typeof incomeData.status === 'object') {
      console.warn("Income status is an object during update, converting to string:", incomeData.status);
      // Try to extract from enum if available
      if (incomeData.status.enum && Array.isArray(incomeData.status.enum) && incomeData.status.enum.length > 0) {
        incomeData.status = incomeData.status.enum[0];
      } else {
        // Default to completed if can't extract from object
        incomeData.status = 'completed';
      }
    }
    
    // Ensure amount is a proper number
    if (incomeData.amount) {
      incomeData.amount = parseFloat(incomeData.amount);
      console.log("Converted amount to number during update:", incomeData.amount);
    }
    
    const updatedIncome = await IncomeModel.findByIdAndUpdate(
      req.params.id,
      incomeData,
      { new: true }
    ).populate("accountId userId");
    
    if (!updatedIncome) {
      return res.status(404).json({ message: "Income not found" });
    }
    
    res.status(200).json({
      message: "Income updated successfully",
      data: updatedIncome
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete income
const deleteIncome = async (req, res) => {
  try {
    const deletedIncome = await IncomeModel.findByIdAndDelete(req.params.id);
    
    if (!deletedIncome) {
      return res.status(404).json({ message: "Income not found" });
    }
    
    res.status(200).json({
      message: "Income deleted successfully",
      data: deletedIncome
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get total income for a user
const getTotalIncome = async (req, res) => {
  try {
    if (!req.query.userId) {
      return res.status(400).json({ message: "UserId is required" });
    }
    
    // Convert userId to ObjectId if needed
    let userIdValue;
    try {
      userIdValue = new mongoose.Types.ObjectId(req.query.userId);
    } catch (err) {
      console.error("Error converting userId to ObjectId:", err);
      userIdValue = req.query.userId; // Use as is if conversion fails
    }
    
    // First approach: Using aggregate
    try {
      const result = await IncomeModel.aggregate([
        { $match: { 
          userId: userIdValue,
          status: { $ne: 'rejected' } // Exclude rejected incomes
        }},
        { $group: {
          _id: null,
          totalAmount: { $sum: "$amount" }
        }}
      ]);
      
      const totalIncome = result.length > 0 ? result[0].totalAmount : 0;
      console.log("Total income calculated via aggregate:", totalIncome);
      
      res.status(200).json({
        message: "Total income retrieved successfully",
        data: { totalIncome }
      });
      return;
    } catch (aggErr) {
      // If aggregate fails, fallback to manual calculation
      console.error("Aggregate query failed, falling back to manual calculation:", aggErr);
    }
    
    // Fallback approach: Manual calculation
    const incomes = await IncomeModel.find({
      userId: userIdValue,
      status: { $ne: 'rejected' }
    });
    
    let totalAmount = 0;
    incomes.forEach(income => {
      if (typeof income.amount === 'number' && !isNaN(income.amount)) {
        totalAmount += income.amount;
      } else if (typeof income.amount === 'string') {
        const parsedAmount = parseFloat(income.amount);
        if (!isNaN(parsedAmount)) {
          totalAmount += parsedAmount;
        }
      }
    });
    
    console.log("Total income calculated manually:", totalAmount);
    
    res.status(200).json({
      message: "Total income retrieved successfully",
      data: { totalIncome: totalAmount }
    });
  } catch (err) {
    console.error("Error calculating total income:", err);
    res.status(500).json({ message: err.message });
  }
};

// New function: Get all incomes (for admin)
const getAllIncomesForAdmin = async (req, res) => {
  try {
    console.log("Admin requesting all incomes");
    
    const incomes = await IncomeModel.find({})
      .populate({
        path: "userId",
        select: "firstName lastName email"
      })
      .populate("accountId")
      .sort({ transcationDate: -1 }); // Sort by date, newest first
    
    console.log(`Found ${incomes.length} income records for admin`);
    
    res.status(200).json({
      message: "All incomes retrieved successfully",
      data: incomes
    });
  } catch (err) {
    console.error("Error fetching all incomes for admin:", err);
    res.status(500).json({ 
      message: "Failed to fetch incomes", 
      error: err.message 
    });
  }
};

module.exports = {
  getAllIncome,
  addIncome,
  getIncomeById,
  updateIncome,
  deleteIncome,
  getTotalIncome,
  getAllIncomesForAdmin
};
