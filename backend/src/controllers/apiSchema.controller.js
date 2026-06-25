const ApiSchema = require("../models/apiSchema.model");
const Project = require("../models/project.model");

const createApiSchema = async (req, res, next) => {
    try {
        const {projectId, collectionName, fields} = req.body;

        const project = await Project.findOne({_id: projectId, userId: req.user._id});

        if(!project) {
            return res.status(404).json({success: false, message: "Project not found"});
        }

        const existingSchema = await ApiSchema.findOne({projectId, collectionName});

        if(existingSchema) {
            return res.status(400).json({success: false, message: "API Schema with this collection name already exists for the project"});
        }

        const apiSchema = new ApiSchema({
            projectId,
            collectionName,
            fields
        });

        await apiSchema.save();

        res.status(201).json({success: true, data: apiSchema});
        
    } catch (error) {
        next(error);
    }
}


const getApiSchemas = async (req, res, next) => {
    try {
        const {projectId} = req.params;

        const project = await Project.findOne({_id: projectId, userId: req.user._id});

        if(!project) {
            return res.status(404).json({success: false, message: "Project not found"});
        }

        const apiSchemas = await ApiSchema.find({projectId});
        
        res.status(200).json({success: true, data: apiSchemas});
    } catch (error) {
        next(error);
    }
}

const deleteApiSchema = async (req, res, next) => {
    try {
        const {apiSchemaId} = req.params;

        const apiSchema = await ApiSchema.findById(apiSchemaId);
        
        if(!apiSchema) {
            return res.status(404).json({success: false, message: "API Schema not found"});
        }

        const project = await Project.findOne({_id: apiSchema.projectId, userId: req.user._id});
        
        if(!project) {
            return res.status(403).json({success: false, message: "You do not have permission to delete this API Schema"});
        }

        await apiSchema.deleteOne();

        res.status(200).json({success: true, message: "API Schema deleted successfully"});

    } catch (error) {
        next(error);
    }
}

module.exports = {
    createApiSchema,
    getApiSchemas,
    deleteApiSchema
}

