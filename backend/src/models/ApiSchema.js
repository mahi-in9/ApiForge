const mongoose = require("mongoose");

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
    fields: [fieldSchema]
}, { timestamps: true });

apiSchema.index({ projectId: 1, collectionName: 1 }, { unique: true });

const ApiSchema = mongoose.model("ApiSchema", apiSchema);

module.exports = ApiSchema;