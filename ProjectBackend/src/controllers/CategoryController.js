const categoryModel= require("../models/CategoryModel")

const addCategory = async (req, res) => {
  try {
    const savedCategory = await categoryModel.create(req.body);
    res.status(201).json({
      message: "Category added successfully",
      data: savedCategory
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllCategory = async (req, res) => {
  try {
    const Category= await categoryModel.find();
    res.status(201).json({
      message: "Category added successfully",
      data:Category
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
    getAllCategory,addCategory
  };
