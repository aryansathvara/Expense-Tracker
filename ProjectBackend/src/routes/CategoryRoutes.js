const routes = require("express").Router()
const categoryController= require("../controllers/CategoryController")


routes.get("/category",categoryController.getAllCategory)
routes.post("/addcategory",categoryController.addCategory)


module.exports = routes
