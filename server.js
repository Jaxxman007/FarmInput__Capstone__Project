require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

connectDB(); // Connect to MongoDB
const app = express();
app.use(express.json()); // Parse JSON body

app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes); // Mount auth routes

app.use("/api/users", userRoutes); // Mount user routes

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
