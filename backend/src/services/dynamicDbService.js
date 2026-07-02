const { getNativeDB } = require('../config/db');
const { ObjectId } = require('mongodb');

// Namespace collections per project to prevent data leakage between tenants.
// e.g., projectId "686aaa" + "products" → actual collection "686aaa_products"
const buildCollectionName = (projectId, collectionName) => {
    return `${projectId}_${collectionName}`;
};

// Safely convert a string ID to MongoDB ObjectId.
// Returns null if the string is not a valid 24-char hex (so callers send 404).
const toObjectId = (id) => {
    try {
        return new ObjectId(id);
    } catch {
        return null;
    }
};

// GET all documents in a collection
const getAll = async (projectId, collectionName) => {
    const db = getNativeDB();
    const col = db.collection(buildCollectionName(projectId, collectionName));
    // find({}) = no filter = all documents. toArray() resolves the cursor.
    return await col.find({}).toArray();
};

// GET one document by its _id
const getById = async (projectId, collectionName, id) => {
    const db = getNativeDB();
    const col = db.collection(buildCollectionName(projectId, collectionName));

    const objectId = toObjectId(id);
    if (!objectId) return null; // malformed id → caller sends 404

    return await col.findOne({ _id: objectId });
};

// POST — insert a new document, injecting server-side timestamps
const create = async (projectId, collectionName, data) => {
    const db = getNativeDB();
    const col = db.collection(buildCollectionName(projectId, collectionName));

    // Timestamps after ...data so server values always win over user-sent ones
    const doc = { ...data, createdAt: new Date(), updatedAt: new Date() };

    const result = await col.insertOne(doc);

    // insertOne only returns { insertedId }, not the full doc. Reconstruct it.
    return { _id: result.insertedId, ...doc };
};

// PUT — partially update a document using $set (preserves unmentioned fields)
const updateById = async (projectId, collectionName, id, data) => {
    const db = getNativeDB();
    const col = db.collection(buildCollectionName(projectId, collectionName));

    const objectId = toObjectId(id);
    if (!objectId) return null;

    // $set is critical — without it, the entire document would be replaced
    // returnDocument: 'after' returns the updated version, not the pre-update one
    return await col.findOneAndUpdate(
        { _id: objectId },
        { $set: { ...data, updatedAt: new Date() } },
        { returnDocument: 'after' }
    );
};

// DELETE — remove a document by ID
const deleteById = async (projectId, collectionName, id) => {
    const db = getNativeDB();
    const col = db.collection(buildCollectionName(projectId, collectionName));

    const objectId = toObjectId(id);
    if (!objectId) return 0; // 0 = nothing deleted → caller sends 404

    const result = await col.deleteOne({ _id: objectId });
    return result.deletedCount; // 1 = deleted, 0 = not found
};

module.exports = { getAll, getById, create, updateById, deleteById };