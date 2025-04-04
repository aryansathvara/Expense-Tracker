const routes = require("express").Router()
const categoryController= require("../controllers/VendorController")


routes.get("/vendor",categoryController.getAllVendor)
routes.post("/addvendor",categoryController.addVendor)


//v-imp
module.exports = routes