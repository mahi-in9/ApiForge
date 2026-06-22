const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
    projectName: {
        type: String,
        required: true,
        trim: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Links to your User model
        required: true
    },
    apiKey: {
        type: String,
        required: true,
        unique: true
        // You will generate this securely using a library like 'crypto' 
        // before saving the project for the first time.
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, { 
    timestamps: true // Automatically adds createdAt and updatedAt
});

module.exports = mongoose.model('Project', projectSchema);