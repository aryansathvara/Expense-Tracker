const vendorModel= require("../models/VendorModel")

const addVendor = async (req, res) => {
  try {
    const savedVendor = await vendorModel.create(req.body);
    res.status(201).json({
      message: "Vendor added successfully",
      data: savedVendor
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllVendor = async (req, res) => {
  try {
    const Vendor= await vendorModel.find().populate("userId");
    res.status(201).json({
      message: "Vendor added successfully",
      data:Vendor
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
    getAllVendor,addVendor
  };
