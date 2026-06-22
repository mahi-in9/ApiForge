const {createProject, getProjects} = require("../controllers/project.controller")
const {protect} = require("../middlewares/auth.middleware")

const router = require("express").Router();

router.post("/", protect, createProject)
router.get("/", protect, getProjects)

module.exports = router;
