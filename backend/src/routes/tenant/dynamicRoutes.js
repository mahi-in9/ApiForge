const express = require('express');
const router = express.Router();

const { authTenant } = require('../../middlewares/authTenant');
const dynamicValidator = require('../../middlewares/dynamicValidator');
const dbService = require('../../services/dynamicDbService');
const ApiSchema = require('../../models/ApiSchema');

// ─── Helper: parse ?populate=field1,field2 ────────────────────────────────────
const parsePopulate = (populateQuery) => {
    if (!populateQuery) return [];
    return populateQuery.split(',').map(s => s.trim()).filter(Boolean);
};

// ─── GET /api/data/:projectId/:collectionName ─────────────────────────────────
// Returns all documents, with optional ?populate=rel1,rel2 support
router.get('/:projectId/:collectionName', authTenant, async (req, res, next) => {
    try {
        const { projectId, collectionName } = req.params;

        // Parse Query Params
        const { page = 1, limit = 10, sort, populate, ...filters } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;

        let sortObj = {};
        if (sort) {
            const [field, order] = sort.split(':');
            sortObj[field] = order === 'desc' || order === '-1' ? -1 : 1;
        }

        const populateFields = parsePopulate(populate);
        const queryParams = { query: filters, sort: sortObj, skip, limit: limitNum };

        let documents;

        if (populateFields.length > 0) {
            // Load schema to get relationship definitions
            const schema = await ApiSchema.findOne({ projectId, collectionName });
            const relationships = schema ? schema.relationships : [];
            documents = await dbService.getWithPopulate(projectId, collectionName, queryParams, populateFields, relationships);
        } else {
            documents = await dbService.getAll(projectId, collectionName, queryParams);
        }

        const total = await dbService.count(projectId, collectionName, filters);

        res.status(200).json({
            success: true,
            pagination: {
                total,
                page: pageNum,
                limit: limitNum,
                totalPages: Math.ceil(total / limitNum)
            },
            count: documents.length,
            data: documents
        });
    } catch (error) {
        next(error);
    }
});

// ─── GET /api/data/:projectId/:collectionName/:id ─────────────────────────────
// Returns one document by ID
router.get('/:projectId/:collectionName/:id', authTenant, async (req, res, next) => {
    try {
        const { projectId, collectionName, id } = req.params;
        const document = await dbService.getById(projectId, collectionName, id);

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        res.status(200).json({ success: true, data: document });
    } catch (error) {
        next(error);
    }
});

// ─── POST /api/data/:projectId/:collectionName ────────────────────────────────
// Creates a new document
router.post('/:projectId/:collectionName', authTenant, dynamicValidator, async (req, res, next) => {
    try {
        const { projectId, collectionName } = req.params;
        const document = await dbService.create(projectId, collectionName, req.body);
        res.status(201).json({ success: true, data: document });
    } catch (error) {
        if (error.message.includes('Duplicate key error')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
});

// ─── PUT /api/data/:projectId/:collectionName/:id ─────────────────────────────
// Full update of an existing document
router.put('/:projectId/:collectionName/:id', authTenant, dynamicValidator, async (req, res, next) => {
    try {
        const { projectId, collectionName, id } = req.params;
        const document = await dbService.updateById(projectId, collectionName, id, req.body);

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        res.status(200).json({ success: true, data: document });
    } catch (error) {
        if (error.message.includes('Duplicate key error')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
});

// ─── PATCH /api/data/:projectId/:collectionName/:id ──────────────────────────
// Partial update (same handler, dynamicValidator allows partial fields on PATCH)
router.patch('/:projectId/:collectionName/:id', authTenant, dynamicValidator, async (req, res, next) => {
    try {
        const { projectId, collectionName, id } = req.params;
        const document = await dbService.updateById(projectId, collectionName, id, req.body);

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        res.status(200).json({ success: true, data: document });
    } catch (error) {
        if (error.message.includes('Duplicate key error')) {
            return res.status(400).json({ success: false, message: error.message });
        }
        next(error);
    }
});

// ─── DELETE /api/data/:projectId/:collectionName/:id ─────────────────────────
// Deletes a document (respects relationship onDelete strategies via validator)
router.delete('/:projectId/:collectionName/:id', authTenant, async (req, res, next) => {
    try {
        const { projectId, collectionName, id } = req.params;

        // Load schema to check relationship deletion strategies
        const schema = await ApiSchema.findOne({ projectId, collectionName });
        if (schema && schema.relationships.length > 0) {
            // Check for RESTRICT relationships — if any related doc exists, block deletion
            const { getNativeDB } = require('../../config/db');
            const { ObjectId } = require('mongodb');
            const db = getNativeDB();

            for (const rel of schema.relationships) {
                if (rel.onDelete === 'restrict' && (rel.type === 'one-to-many' || rel.type === 'one-to-one')) {
                    // Check if the target collection has documents pointing to this document
                    const targetColName = `${projectId}_${rel.toCollection}`;
                    const targetCol = db.collection(targetColName);
                    const refCount = await targetCol.countDocuments({ [rel.fromField]: new ObjectId(id) });
                    if (refCount > 0) {
                        return res.status(400).json({
                            success: false,
                            message: `Cannot delete: ${refCount} document(s) in '${rel.toCollection}' still reference this record (RESTRICT policy on relationship '${rel.name}')`
                        });
                    }
                }

                if (rel.onDelete === 'cascade' && (rel.type === 'one-to-many' || rel.type === 'one-to-one')) {
                    // Cascade-delete all related documents
                    const targetColName = `${projectId}_${rel.toCollection}`;
                    const { getNativeDB } = require('../../config/db');
                    const { ObjectId } = require('mongodb');
                    const db = getNativeDB();
                    const targetCol = db.collection(targetColName);
                    await targetCol.deleteMany({ [rel.fromField]: new ObjectId(id) });
                }

                if (rel.onDelete === 'set-null' && (rel.type === 'one-to-many' || rel.type === 'one-to-one')) {
                    // Set the foreign key field to null on related documents
                    const targetColName = `${projectId}_${rel.toCollection}`;
                    const { getNativeDB } = require('../../config/db');
                    const { ObjectId } = require('mongodb');
                    const db = getNativeDB();
                    const targetCol = db.collection(targetColName);
                    await targetCol.updateMany(
                        { [rel.fromField]: new ObjectId(id) },
                        { $set: { [rel.fromField]: null, updatedAt: new Date() } }
                    );
                }
            }
        }

        const deletedCount = await dbService.deleteById(projectId, collectionName, id);

        if (!deletedCount) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        res.status(200).json({ success: true, message: 'Document deleted successfully' });
    } catch (error) {
        next(error);
    }
});

module.exports = router;