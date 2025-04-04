const accountModel= require("../models/AccountModel")
const AccountModel = require('../models/AccountModel');


const addAccount = async (req, res) => {
  try {
    const savedAccount = await AccountModel.create(req.body);
    res.status(201).json({
      message: "Account added successfully",
      data: savedAccount
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllAccount = async (req, res) => {
  try {
    const Account= await accountModel.find().populate("userId");
    res.status(201).json({
      message: "Account added successfully",
      data:Account
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
    getAllAccount,addAccount
  };
