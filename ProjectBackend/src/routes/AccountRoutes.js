const routes = require("express").Router()
const accountController= require("../controllers/AccountController")


routes.get("/account",accountController.getAllAccount)
routes.post("/addaccount",accountController.addAccount)



module.exports = routes