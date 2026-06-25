const Project = require("../models/Project");

const authTenant = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({success: false, message: "Unauthorized"});
        }

        const apiKey = authHeader.split(" ")[1];

        const projectId = req.params.projectId || req.body.projectId;
        
        if (!projectId) {
            return res.status(400).json({success: false, message: "Project ID is required"});
        }

        const project = await Project.findOne({_id: projectId, apiKey});

        if (!project) {
            return res.status(401).json({success: false, message: "Unauthorized"});
        }

        if(!project.isActive) {
            return res.status(403).json({success: false, message: "Project is inactive"});
        }
        
        req.project = project;
        next();
    } catch (error) {
        next(error);   
    }
}

module.exports = {authTenant};

