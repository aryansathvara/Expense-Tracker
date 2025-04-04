const subcategoryModel= require("../models/SubCategoryModel")

const addSubCategory = async (req, res) => {
  try {
    const savedSubCategory = await subcategoryModel.create(req.body);
    res.status(201).json({
      message: "SubCategory added successfully",
      data: savedSubCategory
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const getAllSubCategory = async (req, res) => {
  try {
    // Check if categoryId is provided in the query parameters
    const { categoryId } = req.query;
    
    let query = {};
    // If categoryId is provided, filter subcategories by that categoryId
    if (categoryId) {
      query.categoryId = categoryId;
    }
    
    const SubCategory = await subcategoryModel.find(query).populate("userId categoryId");
    res.status(200).json({
      message: "Subcategories retrieved successfully",
      data: SubCategory
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
    getAllSubCategory,addSubCategory
  };
