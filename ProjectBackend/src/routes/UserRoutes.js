const routes = require("express").Router()
const userController = require("../controllers/UserController")

routes.post("/user",userController.signup)
routes.post("/user/login",userController.loginUser)
routes.post("/adduser",userController.addUser)
routes.delete("/user/:id", userController.deleteUser)
routes.get("/users",userController.getAllUser)
routes.get("/user/:id",userController.getuserById)
routes.put("/user/:id", userController.updateUser)

// Update the routes to use /user prefix to match with the client API calls
routes.post("/user/forgotpassword", userController.forgotPassword)
routes.post("/user/resetpassword", userController.resetpassword)

// Test endpoint for development - Add password reset endpoint
routes.post("/user/reset-test", userController.resetPasswordForTesting)

// Debugging endpoints - do not use in production
routes.post("/user/verify-login", userController.verifyLoginDetails)
routes.post("/user/set-plain-password", userController.setPlainPassword)

module.exports = routes
