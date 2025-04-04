const ExpenceModel= require("../models/ExpenceModel")
const multer = require("multer")
// const path = require ("path")
const cloudinaryUtil = require("../utils/CloudnaryUtil") 
const mongoose = require("mongoose")



const storage = multer.diskStorage({
  destination: "./uploads",
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

//multer object....

const upload = multer({
  storage: storage,
  //fileFilter:
}).single("image");


// const addExpence = async (req, res) => {
//   try {
//     const savedExpence = await ExpenceModel.create(req.body);
//     console.log(savedExpence)
//     res.status(201).json({
//       message: "Expence added successfully",
//       data: savedExpence
//     });
//   } catch (err) {
//     res.status(500).json({ message:"eror" });
//   }
// };


const addex = async(req,res) =>{ 
  try{

    const addExpence = await ExpenceModel.create(req.body);
    res.status(200).json({
      message:"data posted",
      data:addExpence
    })
  }catch(err){
    res.status(500).json({
      message:"error"
    })
  }
}
const getAllExpence = async (req, res) => {
  try {
    console.log("Fetching all expenses");
    const Expence = await ExpenceModel.find()
      .populate("categoryId")
      .populate("subcategoryId")
      .populate("vendorId")
      .populate("accountId")
      .populate("userId");
      
    console.log(`Found ${Expence.length} expenses`);
    
    // Add default category and user values for any missing references
    const formattedExpenses = Expence.map(expense => {
      const expenseObj = expense.toObject();
      
      // If userId is null or undefined, provide a default system user
      if (!expenseObj.userId) {
        expenseObj.category = expenseObj.category || expenseObj.categoryId?.name || "Uncategorized";
      }
      
      return expenseObj;
    });
    
    res.status(200).json({
      message: "Expenses fetched successfully",
      data: Expence
    });
  } catch (err) {
    console.error("Error fetching expenses:", err);
    res.status(500).json({ 
      message: "Error fetching expenses", 
      error: err.message 
    });
  }
};

const getAllExpenceByUserId = async (req, res) => {
  try {
    console.log(`Fetching expenses for user ID: ${req.params.userId}`);
    
    if (!req.params.userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Validate if the userId is a valid ObjectId
    let userIdFilter;
    
    try {
      // Check if the userId is a valid ObjectId format
      if (mongoose.Types.ObjectId.isValid(req.params.userId)) {
        // If it's a valid ObjectId, use it properly with 'new' operator
        userIdFilter = { userId: new mongoose.Types.ObjectId(req.params.userId) };
        console.log("Using valid ObjectId format for query");
      } else {
        // If not a valid ObjectId, it might be a string comparison
        console.log("Using string comparison for userId");
        userIdFilter = { userId: req.params.userId };
      }
    } catch (err) {
      console.log("Error parsing ObjectId, using string comparison:", err);
      userIdFilter = { userId: req.params.userId };
    }
    
    console.log("User ID filter:", userIdFilter);
    
    // Execute the query with the appropriate filter
    const expenses = await ExpenceModel
      .find(userIdFilter)
      .populate("categoryId")
      .populate("subcategoryId")
      .populate("vendorId")
      .populate("accountId")
      .populate("userId");
    
    console.log(`Found ${expenses.length} expenses for user ID: ${req.params.userId}`);
    
    res.status(200).json({
      message: expenses.length > 0 ? "Expenses fetched successfully" : "No expenses found for this user",
      data: expenses
    });
  } catch (err) {
    console.error(`Error fetching expenses for user ID ${req.params.userId}:`, err);
    res.status(500).json({ 
      message: "Error fetching expenses", 
      error: err.message 
    });
  }
};


const addExpenceWithFile = async (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.log(err);
      res.status(500).json({
        message: err.message,
      });
    } else {
      // database data store
      //cloundinary

      const cloundinaryResponse = await cloudinaryUtil.uploadFileToCloudinary(req.file);
      console.log(cloundinaryResponse);
      console.log(req.body);

      //store data in database
      req.body.expenceURL = cloundinaryResponse.secure_url
      const savedExpence = await ExpenceModel.create(req.body);

      res.status(200).json({
        message: "expence saved successfully",
        data: savedExpence
      });
    }
  });
};

const updateExpence = async (req, res) => {
  //update tablename set  ? where id = ?
  //update new data -->req.body
  //id -->req.params.id

  try {
    const updatedExpence = await ExpenceModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json({
      message: "Expence updated successfully",
      data: updatedExpence,
    });
  } catch (err) {
    res.status(500).json({
      message: "error while update Expence",
      err: err,
    });
  }
};

const getExpenceById= async(req,res)=>{
  try {
    const expence = await ExpenceModel.findById(req.params.id)
      .populate('categoryId')
      .populate('subcategoryId')
      .populate('vendorId')
      .populate('accountId')
      .populate('userId');
      
    if (!expence) {
      res.status(404).json({ message: "No expence found" });
    } else {
      res.status(200).json({
        message: "Expence found successfully",
        data: expence,
      });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Update expense status
const updateExpenceStatus = async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({
        message: "Status is required"
      });
    }
    
    const updatedExpence = await ExpenceModel.findByIdAndUpdate(
      req.params.id,
      { status: status, updatedAt: new Date() },
      { new: true }
    );
    
    if (!updatedExpence) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }
    
    res.status(200).json({
      message: "Expense status updated successfully",
      data: updatedExpence
    });
  } catch (err) {
    console.error("Error updating expense status:", err);
    res.status(500).json({
      message: "Error updating expense status",
      error: err.message
    });
  }
};

// Add comment to expense
const addComment = async (req, res) => {
  try {
    const { text, user } = req.body;
    
    if (!text) {
      return res.status(400).json({
        message: "Comment text is required"
      });
    }
    
    const expense = await ExpenceModel.findById(req.params.id);
    
    if (!expense) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }
    
    // Initialize comments array if it doesn't exist
    if (!expense.comments) {
      expense.comments = [];
    }
    
    // Add new comment
    expense.comments.push({
      user: user || 'Anonymous',
      text: text,
      timestamp: new Date()
    });
    
    // Update the expense with new comment
    const updatedExpense = await expense.save();
    
    res.status(200).json({
      message: "Comment added successfully",
      data: updatedExpense
    });
  } catch (err) {
    console.error("Error adding comment:", err);
    res.status(500).json({
      message: "Error adding comment",
      error: err.message
    });
  }
};


module.exports = {
    getAllExpence,addex,getAllExpenceByUserId,addExpenceWithFile,updateExpence,getExpenceById,
    updateExpenceStatus,addComment
  };
