require("dotenv").config();

const express = require("express");
const cors = require("cors");

const {connectDB} = require("./src/config/db");

const authRoutes = require("./src/routes/system/auth.route");
const projectRoutes = require("./src/routes/system/project.route");
const schemaRoutes = require("./src/routes/system/schemaRoutes");
const dynamicRoutes = require("./src/routes/tenant/dynamicRoutes");

const errorHandler = require("./src/middlewares/error.handler")

const app = express();

connectDB()

app.use(express.json());
app.use(cors({
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
}));

app.get('/', (req, res) => {
    res.send("API-Forge Server is running!");
});

app.use("/api/auth", authRoutes)
app.use("/api/projects", projectRoutes)
app.use("/api/schemas", schemaRoutes)
app.use("/api/data", dynamicRoutes)
app.use(errorHandler)

const PORT = process.env.PORT || 5000;


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  })