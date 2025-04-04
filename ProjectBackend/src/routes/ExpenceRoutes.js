const express = require("express");
const routes = express.Router(); // Define 'routes' correctly
const expenceController = require("../controllers/ExpenceController");

routes.get("/expence", expenceController.getAllExpence);
routes.post("/addexpence", expenceController.addex);
routes.get('/getExpencebyuserid/:userId', expenceController.getAllExpenceByUserId);
routes.post('/addWithFile', expenceController.addExpenceWithFile);
routes.put("/updateExpence/:id",expenceController.updateExpence);
routes.get("/getExpenceById/:id",expenceController.getExpenceById);
routes.put("/updateExpenceStatus/:id", expenceController.updateExpenceStatus);
routes.post("/addComment/:id", expenceController.addComment);

module.exports = routes; // Export 'routes'
