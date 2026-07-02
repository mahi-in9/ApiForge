const express = require('express');
const router = express.Router();

// authTenant = API-key guard for tenant (end-user) apps. NOT jwt protect.
const { authTenant } = require('../../middlewares/authTenant');

// dynamicValidator = checks req.body against the user-defined schema
const dynamicValidator = require('../../middlewares/dynamicValidator');

const dbService = require('../../services/dynamicDbService');

// GET /api/data/:projectId/:collectionName
// Returns all documents in a collection
router.get('/:projectId/:collectionName', authTenant, async (req, res, next) => {
    try {
        const { projectId, collectionName } = req.params;
        const documents = await dbService.getAll(projectId, collectionName);
        res.status(200).json({
            success: true,
            count: documents.length,
            data: documents
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/data/:projectId/:collectionName/:id
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

// POST /api/data/:projectId/:collectionName
// Creates a new document — validator runs before handler
router.post('/:projectId/:collectionName', authTenant, dynamicValidator, async (req, res, next) => {
    try {
        const { projectId, collectionName } = req.params;
        const document = await dbService.create(projectId, collectionName, req.body);
        res.status(201).json({ success: true, data: document });
    } catch (error) {
        next(error);
    }
});

// PUT /api/data/:projectId/:collectionName/:id
// Updates an existing document — validator runs to check new body
router.put('/:projectId/:collectionName/:id', authTenant, dynamicValidator, async (req, res, next) => {
    try {
        const { projectId, collectionName, id } = req.params;
        const document = await dbService.updateById(projectId, collectionName, id, req.body);

        if (!document) {
            return res.status(404).json({ success: false, message: 'Document not found' });
        }

        res.status(200).json({ success: true, data: document });
    } catch (error) {
        next(error);
    }
});

// DELETE /api/data/:projectId/:collectionName/:id
// Deletes a document — no validator (no body to validate)
router.delete('/:projectId/:collectionName/:id', authTenant, async (req, res, next) => {
    try {
        const { projectId, collectionName, id } = req.params;
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