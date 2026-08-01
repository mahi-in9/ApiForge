const mongoose = require("mongoose");

// ─── Field sub-document ──────────────────────────────────────────────────────
const fieldSchema = new mongoose.Schema({
    fieldName: {
        type: String,
        required: true,
        trim: true
    },
    fieldType: {
        type: String,
        required: true,
        enum: ["String", "Number", "Boolean", "Date", "Array", "Object", "GeoPoint", "Address", "ObjectId"]
    },
    referenceTo: {
        type: String, // Which collection this ObjectId points to
        default: null
    },
    defaultValue: {
        type: String,
        default: null
    },
    isRequired: {
        type: Boolean,
        default: false
    },
    isUnique: {
        type: Boolean,
        default: false
    },
    isIndexed: {
        type: Boolean,
        default: false
    },
    enumValues: {
        type: [String],
        default: []
    },
    minLength: {
        type: Number,
        default: null
    },
    maxLength: {
        type: Number,
        default: null
    },
    min: {
        type: Number,
        default: null
    },
    max: {
        type: Number,
        default: null
    }
}, { _id: false });

// ─── Relationship sub-document ───────────────────────────────────────────────
const relationshipSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        enum: ["one-to-one", "one-to-many", "many-to-one", "many-to-many"]
    },
    fromField: {
        type: String,
        required: true
        // fieldName in THIS collection that holds the reference
    },
    toCollection: {
        type: String,
        required: true
        // target collection name (lowercase)
    },
    toField: {
        type: String,
        default: null
        // field in target collection (used for many-to-many join reference)
    },
    onDelete: {
        type: String,
        enum: ["cascade", "restrict", "set-null"],
        default: "restrict"
    },
    populatePath: {
        type: String,
        default: null
        // virtual path name to use in ?populate= query param
    },
    label: {
        type: String,
        default: null
        // human-readable label shown on the visual edge
    }
}, { _id: true }); // keep _id so we can delete individual relationships

// ─── Root ApiSchema document ─────────────────────────────────────────────────
const apiSchema = new mongoose.Schema({
    projectId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Project",
        required: true
    },
    collectionName: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    fields: [fieldSchema],
    relationships: [relationshipSchema],
    // Persisted canvas position for the Visual Schema Designer
    nodePosition: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 }
    }
}, { timestamps: true });

apiSchema.index({ projectId: 1, collectionName: 1 }, { unique: true });

const ApiSchema = mongoose.model("ApiSchema", apiSchema);

module.exports = ApiSchema;