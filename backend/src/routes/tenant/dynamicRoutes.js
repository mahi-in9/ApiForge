const express = require('express');
const router = express.Router();

const { authTenant } = require('../../middlewares/authTenant');
const dynamicValidator = require('../../middlewares/dynamicValidator');
const dbService = require('../../services/dynamicDbService');

// GET /api/data/:projectId/:collectionName
// Returns all documents in a collection
router.get('/:projectId/:collectionName', authTenant, async (req, res, next) => {
    try {
        const { projectId, collectionName } = req.params;
        
        // Parse Query Params (Engine V2)
        const { page = 1, limit = 10, sort, ...filters } = req.query;
        const pageNum = parseInt(page);
        const limitNum = parseInt(limit);
        const skip = (pageNum - 1) * limitNum;
        
        let sortObj = {};
        if (sort) {
            // e.g. sort=price:desc or sort=createdAt:-1
            const [field, order] = sort.split(':');
            sortObj[field] = order === 'desc' || order === '-1' ? -1 : 1;
        }

        const documents = await dbService.getAll(projectId, collectionName, {
            query: filters,
            sort: sortObj,
            skip,
            limit: limitNum
        });
        
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

// PUT /api/data/:projectId/:collectionName/:id
// Updates an existing document
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

// DELETE /api/data/:projectId/:collectionName/:id
// Deletes a document
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