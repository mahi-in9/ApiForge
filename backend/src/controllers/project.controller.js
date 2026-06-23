const Project = require("../models/Project");
const User = require("../models/User");
const crypto = require("crypto");

const createProject = async (req, res, next) => {
    try {
        const {projectName} = req.body;
        const userId = req.user._id;

        // Create a new project
        const newProject = new Project({
            projectName,
            userId,
            apiKey: crypto.randomBytes(32).toString('hex')
        });

        await newProject.save();

        return res.status(201).json({success: true, data: {project: newProject}});
    } catch (error) {
        next(error);
    }
}

const getProjects = async (req, res, next) => {
    try {
        const projects = await Project.find({userId: req.user._id, isActive: true}).populate("userId", "name email")
        
        if (!projects || projects.length === 0) {
            return res.status(404).json({success: false, message: "No projects found"})
        }
        return res.status(200).json({success: true, data: {projects}})
    } catch (error) {
        next(error)
    }
}

const deleteProject = async (req, res, next) => {
    try {
        const projectId = req.params.id;
        const project = await Project.findOneAndUpdate(
            {_id: projectId, userId: req.user._id},
            {isActive: false},
            {new: true}
        );
        
        if (!project) {
            return res.status(404).json({success: false, message: "Project not found"})
        }
        return res.status(200).json({success: true, message: "Project deleted successfully"})
    } catch (error) {
        next(error)
    }
}

module.exports = {createProject, getProjects, deleteProject};

