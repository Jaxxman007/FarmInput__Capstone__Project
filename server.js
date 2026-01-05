require("dotenv").config();
const cors = require("cors");
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

connectDB(); // Connect to MongoDB
const app = express();

//  middleware
app.use(express.json()); // Parse JSON body
app.use(express.urlencoded({ extended: true }));
app.use(cors()); // Enable CORS

// Routes
app.use("/api/auth", authRoutes); // Mount auth routes
app.use("/api/users", userRoutes); // Mount user routes


// Error handler
app.use((err, req, res, next) => { 
  console.error(err.stack); 
  res.status(500).json({ success: false, message: "Server Error" }); });

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
