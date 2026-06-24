require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {connectDB} = require("./src/config/db");

const authRoutes = require("./src/routes/auth.route");
const projectRoutes = require("./src/routes/project.route");

const errorHandler = require("./src/middlewares/error.handler")

const app = express();

connectDB()

app.use(express.json());
app.use(cors({
    based: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.get('/', (req, res) => {
    res.send("API-Forge Server is running!");
});

app.use("/api/auth", authRoutes)
app.use("/api/projects", projectRoutes)

// app.use(errorHandler)

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })