const { getNativeDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// ─── GET all documents ────────────────────────────────────────────────────────
const getAll = async (projectId, collectionName, queryParams = {}) => {
    const { query = {}, sort = {}, skip = 0, limit = 0 } = queryParams;
    const db = getNativeDB();
    const col = db.collection(buildCollectionName(projectId, collectionName));

    let cursor = col.find(query);

    if (Object.keys(sort).length > 0) cursor = cursor.sort(sort);
    if (skip > 0) cursor = cursor.skip(skip);
    if (limit > 0) cursor = cursor.limit(limit);

    return await cursor.toArray();
};

// ─── GET all documents WITH populate ($lookup aggregation) ────────────────────
/**
 * @param {string} projectId
 * @param {string} collectionName
 * @param {object} queryParams  - { query, sort, skip, limit }
 * @param {string[]} populateFields - array of relationship populatePath names
 * @param {object[]} relationships  - relationship definitions from ApiSchema
 */
const getWithPopulate = async (projectId, collectionName, queryParams = {}, populateFields = [], relationships = []) => {
    const { query = {}, sort = {}, skip = 0, limit = 0 } = queryParams;
    const db = getNativeDB();
    const colName = buildCollectionName(projectId, collectionName);

    const pipeline = [];

    // Match stage (filtering)
    if (Object.keys(query).length > 0) {
        pipeline.push({ $match: query });
    }

    // Sort stage
    if (Object.keys(sort).length > 0) {
        pipeline.push({ $sort: sort });
    }

    // Skip + Limit for pagination
    if (skip > 0) pipeline.push({ $skip: skip });
    if (limit > 0) pipeline.push({ $limit: limit });

    // $lookup stages for each requested populate field
    for (const populatePath of populateFields) {
        const rel = relationships.find(r => r.populatePath === populatePath || r.name === populatePath);
        if (!rel) continue;

        const targetColName = buildCollectionName(projectId, rel.toCollection);

        if (rel.type === 'many-to-many') {
            // Many-to-many: fromField holds an array of IDs
            pipeline.push({
                $lookup: {
                    from: targetColName,
                    localField: rel.fromField,
                    foreignField: '_id',
                    as: populatePath
                }
            });
        } else {
            // One-to-one / one-to-many / many-to-one: fromField holds a single ID
            pipeline.push({
                $lookup: {
                    from: targetColName,
                    localField: rel.fromField,
                    foreignField: '_id',
                    as: populatePath
                }
            });

            // For single-reference types, unwrap the array to a single object
            if (rel.type === 'many-to-one' || rel.type === 'one-to-one') {
                pipeline.push({
                    $unwind: {
                        path: `$${populatePath}`,
                        preserveNullAndEmptyArrays: true
                    }
                });
            }
        }
    }

    const col = db.collection(colName);
    return await col.aggregate(pipeline).toArray();
};

// ─── Count total documents ────────────────────────────────────────────────────
const count = async (projectId, collectionName, query = {}) => {
    const db = getNativeDB();
    const col = db.collection(buildCollectionName(projectId, collectionName));
    return await col.countDocuments(query);
};

// ─── GET one document by ID ───────────────────────────────────────────────────
const getById = async (projectId, collectionName, id) => {
    const db = getNativeDB();
    const col = db.collection(buildCollectionName(projectId, collectionName));

    const objectId = toObjectId(id);
    if (!objectId) return null;

    return await col.findOne({ _id: objectId });
};

// ─── POST — insert a new document ─────────────────────────────────────────────
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

// ─── PUT — update a document ──────────────────────────────────────────────────
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

// ─── DELETE — remove a document ───────────────────────────────────────────────
const deleteById = async (projectId, collectionName, id) => {
    const db = getNativeDB();
    const col = db.collection(buildCollectionName(projectId, collectionName));

    const objectId = toObjectId(id);
    if (!objectId) return 0;

    const result = await col.deleteOne({ _id: objectId });
    return result.deletedCount;
};

module.exports = { getAll, getWithPopulate, getById, create, updateById, deleteById, count };