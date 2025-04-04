const routes = require("express").Router()
const categoryController= require("../controllers/SubCategoryController")


routes.get("/subcategory",categoryController.getAllSubCategory)
routes.post("/addsubcategory",categoryController.addSubCategory)


//v-imp
module.exports = routes