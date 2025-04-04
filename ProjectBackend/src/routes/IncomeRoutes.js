const routes = require("express").Router()
const incomeController = require("../controllers/IncomeController")

// Get all incomes or filtered by userId
routes.get("/income", incomeController.getAllIncome)

// Add new income
routes.post("/addincome", incomeController.addIncome)

// Get total income for a user
routes.get("/income/total", incomeController.getTotalIncome)

// Admin route to get all incomes
routes.get("/income/all", incomeController.getAllIncomesForAdmin)

// Get, update, delete income by ID
routes.get("/income/:id", incomeController.getIncomeById)
routes.put("/income/:id", incomeController.updateIncome)
routes.delete("/income/:id", incomeController.deleteIncome)

module.exports = routes