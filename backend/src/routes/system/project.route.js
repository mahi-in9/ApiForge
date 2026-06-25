const {createProject, getProjects, deleteProject} = require("../controllers/project.controller")
const {protect} = require("../middlewares/protect")

const router = require("express").Router();

router.post("/", protect, createProject)
router.delete("/:id", protect, deleteProject)
router.get("/", protect, getProjects)

module.exports = router;
