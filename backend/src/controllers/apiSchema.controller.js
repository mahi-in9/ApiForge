const ApiSchema = require("../models/ApiSchema");
const Project = require("../models/Project");
const { getNativeDB } = require("../config/db");

// ─── Helper: verify project ownership ────────────────────────────────────────
const verifyProjectOwnership = async (projectId, userId) => {
    const project = await Project.findOne({ _id: projectId, userId });
    return project;
};

// ─── Helper: build indexes from fields ───────────────────────────────────────
const buildIndexes = async (db, colName, fields) => {
    const col = db.collection(colName);
    const uniqueFields = fields.filter(f => f.isUnique);
    for (const field of uniqueFields) {
        await col.createIndex({ [field.fieldName]: 1 }, { unique: true, background: true });
    }
    const indexedFields = fields.filter(f => f.isIndexed && !f.isUnique);
    for (const field of indexedFields) {
        await col.createIndex({ [field.fieldName]: 1 }, { background: true });
    }
};

// ─── CREATE ───────────────────────────────────────────────────────────────────
const createApiSchema = async (req, res, next) => {
    try {
        const { projectId, collectionName, fields = [], relationships = [], nodePosition } = req.body;

        const project = await verifyProjectOwnership(projectId, req.user._id);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        const existingSchema = await ApiSchema.findOne({ projectId, collectionName });
        if (existingSchema) {
            return res.status(400).json({ success: false, message: "API Schema with this collection name already exists for the project" });
        }

        const apiSchema = new ApiSchema({
            projectId,
            collectionName,
            fields,
            relationships,
            nodePosition: nodePosition || { x: 0, y: 0 }
        });

        await apiSchema.save();

        // Build indexes in the native MongoDB collection
        const db = getNativeDB();
        const colName = `${projectId}_${collectionName}`;
        await buildIndexes(db, colName, fields);

        res.status(201).json({ success: true, data: apiSchema });

    } catch (error) {
        next(error);
    }
};

// ─── GET ALL (for a project) ──────────────────────────────────────────────────
const getApiSchemas = async (req, res, next) => {
    try {
        const { projectId } = req.params;

        const project = await verifyProjectOwnership(projectId, req.user._id);
        if (!project) {
            return res.status(404).json({ success: false, message: "Project not found" });
        }

        const apiSchemas = await ApiSchema.find({ projectId });
        res.status(200).json({ success: true, data: apiSchemas });

    } catch (error) {
        next(error);
    }
};

// ─── UPDATE (fields + relationships + nodePosition) ───────────────────────────
const updateApiSchema = async (req, res, next) => {
    try {
        const { apiSchemaId } = req.params;
        const { fields, relationships, nodePosition, collectionName } = req.body;

        const apiSchema = await ApiSchema.findById(apiSchemaId);
        if (!apiSchema) {
            return res.status(404).json({ success: false, message: "API Schema not found" });
        }

        const project = await verifyProjectOwnership(apiSchema.projectId, req.user._id);
        if (!project) {
            return res.status(403).json({ success: false, message: "Permission denied" });
        }

        // Apply updates
        if (fields !== undefined) apiSchema.fields = fields;
        if (relationships !== undefined) apiSchema.relationships = relationships;
        if (nodePosition !== undefined) apiSchema.nodePosition = nodePosition;
        // collectionName changes are disallowed (would break existing data)

        await apiSchema.save();

        // Rebuild indexes if fields changed
        if (fields !== undefined) {
            const db = getNativeDB();
            const colName = `${apiSchema.projectId}_${apiSchema.collectionName}`;
            await buildIndexes(db, colName, fields);
        }

        res.status(200).json({ success: true, data: apiSchema });

    } catch (error) {
        next(error);
    }
};

// ─── ADD RELATIONSHIP ─────────────────────────────────────────────────────────
const addRelationship = async (req, res, next) => {
    try {
        const { apiSchemaId } = req.params;
        const { name, type, fromField, toCollection, toField, onDelete, populatePath, label } = req.body;

        const apiSchema = await ApiSchema.findById(apiSchemaId);
        if (!apiSchema) {
            return res.status(404).json({ success: false, message: "API Schema not found" });
        }

        const project = await verifyProjectOwnership(apiSchema.projectId, req.user._id);
        if (!project) {
            return res.status(403).json({ success: false, message: "Permission denied" });
        }

        // Ensure relationship name is unique within the schema
        const nameExists = apiSchema.relationships.some(r => r.name === name);
        if (nameExists) {
            return res.status(400).json({ success: false, message: `Relationship '${name}' already exists on this collection` });
        }

        // Ensure the target collection exists in this project
        const targetSchema = await ApiSchema.findOne({ projectId: apiSchema.projectId, collectionName: toCollection });
        if (!targetSchema) {
            return res.status(400).json({ success: false, message: `Target collection '${toCollection}' does not exist in this project` });
        }

        const newRel = {
            name,
            type,
            fromField,
            toCollection,
            toField: toField || null,
            onDelete: onDelete || "restrict",
            populatePath: populatePath || name,
            label: label || null
        };

        apiSchema.relationships.push(newRel);
        await apiSchema.save();

        const added = apiSchema.relationships[apiSchema.relationships.length - 1];
        res.status(201).json({ success: true, data: added });

    } catch (error) {
        next(error);
    }
};

// ─── DELETE RELATIONSHIP ──────────────────────────────────────────────────────
const deleteRelationship = async (req, res, next) => {
    try {
        const { apiSchemaId, relId } = req.params;

        const apiSchema = await ApiSchema.findById(apiSchemaId);
        if (!apiSchema) {
            return res.status(404).json({ success: false, message: "API Schema not found" });
        }

        const project = await verifyProjectOwnership(apiSchema.projectId, req.user._id);
        if (!project) {
            return res.status(403).json({ success: false, message: "Permission denied" });
        }

        const relIndex = apiSchema.relationships.findIndex(r => r._id.toString() === relId);
        if (relIndex === -1) {
            return res.status(404).json({ success: false, message: "Relationship not found" });
        }

        apiSchema.relationships.splice(relIndex, 1);
        await apiSchema.save();

        res.status(200).json({ success: true, message: "Relationship deleted successfully" });

    } catch (error) {
        next(error);
    }
};

// ─── DELETE SCHEMA ────────────────────────────────────────────────────────────
const deleteApiSchema = async (req, res, next) => {
    try {
        const { apiSchemaId } = req.params;

        const apiSchema = await ApiSchema.findById(apiSchemaId);
        if (!apiSchema) {
            return res.status(404).json({ success: false, message: "API Schema not found" });
        }

        const project = await verifyProjectOwnership(apiSchema.projectId, req.user._id);
        if (!project) {
            return res.status(403).json({ success: false, message: "You do not have permission to delete this API Schema" });
        }

        await apiSchema.deleteOne();

        res.status(200).json({ success: true, message: "API Schema deleted successfully" });

    } catch (error) {
        next(error);
    }
};

module.exports = {
    createApiSchema,
    getApiSchemas,
    updateApiSchema,
    addRelationship,
    deleteRelationship,
    deleteApiSchema
};
