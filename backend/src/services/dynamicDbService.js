const { getNativeDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// Namespace collections per project to prevent data leakage between tenants.
const buildCollectionName = (projectId, collectionName) => {
    return `${projectId}_${collectionName}`;
};

// Safely convert a string ID to MongoDB ObjectId.
const toObjectId = (id) => {
    try {
        return new ObjectId(id);
    } catch {
        return null;
    }
};

// GET all documents in a collection
const getAll = async (projectId, collectionName, queryParams = {}) => {
    const { query = {}, sort = {}, skip = 0, limit = 0 } = queryParams;
    const db = getNativeDB();
    const col = db.collection(buildCollectionName(projectId, collectionName));

    let cursor = col.find(query);

    if (Object.keys(sort).length > 0) {
        cursor = cursor.sort(sort);
    }

    if (skip > 0) {
        cursor = cursor.skip(skip);
    }

    if (limit > 0) {
        cursor = cursor.limit(limit);
    }

    return await cursor.toArray();
};

// Engine V2: Count total documents for pagination calculations
const count = async (projectId, collectionName, query = {}) => {
    const db = getNativeDB();
    const col = db.collection(buildCollectionName(projectId, collectionName));
    return await col.countDocuments(query);
};

// GET one document by its _id
const getById = async (projectId, collectionName, id) => {
    const db = getNativeDB();
    const col = db.collection(buildCollectionName(projectId, collectionName));

    const objectId = toObjectId(id);
    if (!objectId) return null;

    return await col.findOne({ _id: objectId });
};

// POST — insert a new document, injecting server-side timestamps
const create = async (projectId, collectionName, data) => {
    const db = getNativeDB();
    const col = db.collection(buildCollectionName(projectId, collectionName));

    const doc = { ...data, createdAt: new Date(), updatedAt: new Date() };
    
    try {
        const result = await col.insertOne(doc);
        return { _id: result.insertedId, ...doc };
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue || {})[0] || 'unknown';
            const value = (error.keyValue || {})[field] || 'unknown';
            throw new Error(`Duplicate key error: A record with ${field}='${value}' already exists.`);
        }
        throw error;
    }
};

// PUT — partially update a document using $set
const updateById = async (projectId, collectionName, id, data) => {
    const db = getNativeDB();
    const col = db.collection(buildCollectionName(projectId, collectionName));

    const objectId = toObjectId(id);
    if (!objectId) return null;

    try {
        return await col.findOneAndUpdate(
            { _id: objectId },
            { $set: { ...data, updatedAt: new Date() } },
            { returnDocument: 'after' }
        );
    } catch (error) {
        if (error.code === 11000) {
            const field = Object.keys(error.keyValue || {})[0] || 'unknown';
            const value = (error.keyValue || {})[field] || 'unknown';
            throw new Error(`Duplicate key error: A record with ${field}='${value}' already exists.`);
        }
        throw error;
    }
};

// DELETE — remove a document by ID
const deleteById = async (projectId, collectionName, id) => {
    const db = getNativeDB();
    const col = db.collection(buildCollectionName(projectId, collectionName));

    const objectId = toObjectId(id);
    if (!objectId) return 0;

    const result = await col.deleteOne({ _id: objectId });
    return result.deletedCount;
};

module.exports = { getAll, getById, create, updateById, deleteById, count };