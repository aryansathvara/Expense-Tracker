const express = require("express") //express....
const mongoose = require("mongoose")
const cors = require("cors")
//express object..
const app = express()
app.use(cors())
app.use(express.json()) //to accept data as json...

// Add simple health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

//import role routes
const roleRoutes = require("./src/routes/RoleRoutes")
app.use(roleRoutes)

//import user routes
const userRoutes = require("./src/routes/UserRoutes")
app.use(userRoutes)

const categoryRoutes = require("./src/routes/CategoryRoutes")
app.use(categoryRoutes)


const subcategoryRoutes = require("./src/routes/SubCategoryRoutes")
app.use(subcategoryRoutes)

const vendorRoutes = require("./src/routes/VendorRoutes")
app.use(vendorRoutes)

const accountRoutes = require("./src/routes/AccountRoutes")
app.use(accountRoutes)

const expenceRoutes = require("./src/routes/ExpenceRoutes")
app.use("/expense",expenceRoutes)

const incomeRoutes = require("./src/routes/IncomeRoutes")
app.use(incomeRoutes)


mongoose.connect("mongodb://127.0.0.1:27017/node-internship").then(()=>{
    console.log("database connected....")
})


//server creation...
const PORT = 3000

// Create server with error handling
const server = app.listen(PORT, () => {
  console.log("Server started on port number", PORT);
});

// Handle server errors
server.on('error', (error) => {
  if (error.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please try again after stopping the other server or use a different port.`);
    console.log("To fix this on Windows, run: 'npm run stop-server' or use Task Manager to end the Node.js process.");
    process.exit(1);
  } else {
    console.error("Server error:", error);
  }
});


