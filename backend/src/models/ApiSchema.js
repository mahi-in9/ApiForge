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
        enum: ["String", "Number", "Boolean", "Date", "Array", "Object"]
    },
    isRequired: {
        type: Boolean,
        default: false
    }
}, { _id: false });

const ApiSchema = new mongoose.Schema({
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

const ApiSchema = mongoose.model("ApiSchema", ApiSchema);

module.exports = ApiSchema;