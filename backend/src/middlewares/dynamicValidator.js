const ApiSchema = require('../models/ApiSchema');
const { getNativeDB } = require('../config/db');
const { ObjectId } = require('mongodb');

const dynamicValidator = async (req, res, next) => {
    // Only validate on Create and Update operations
    if (req.method !== 'POST' && req.method !== 'PUT') {
        return next();
    }

    try {
        const { projectId, collectionName } = req.params;

        // Fetch the schema definition from the System Layer
        const schema = await ApiSchema.findOne({ projectId, collectionName });

        // If no schema exists yet, you can decide to block it OR allow it (schemaless). 
        // Let's block it to strictly enforce the Schema Builder UI.
        if (!schema) {
            return res.status(400).json({ success: false, message: `No schema defined for collection: ${collectionName}` });
        }

        const payload = req.body;
        const errors = [];

        // Validate each field defined in the schema
        for (const field of schema.fields) {
            let value = payload[field.fieldName];

            // Default Value Injection (if value is missing but a default is defined)
            if ((value === undefined || value === null || value === '') && field.defaultValue) {
                value = field.defaultValue;
                payload[field.fieldName] = value;
            }

            // 1. Check Required Fields
            if (field.isRequired && (value === undefined || value === null || value === '')) {
                errors.push(`'${field.fieldName}' is required.`);
                continue;
            }

            // 2. Check Data Types (only if a value was provided)
            if (value !== undefined && value !== null) {
                const typeMap = {
                    'String': 'string',
                    'Number': 'number',
                    'Boolean': 'boolean',
                    'Array': 'object', // typeof [] is 'object'
                    'Object': 'object',
                    'Date': 'string', // Dates are usually passed as ISO strings in JSON
                    'GeoPoint': 'object',
                    'Address': 'object',
                    'ObjectId': 'string' // Passed as string, validated as ObjectId
                };

                const expectedType = typeMap[field.fieldType];
                
                if (field.fieldType === 'Array' && !Array.isArray(value)) {
                    errors.push(`'${field.fieldName}' must be an Array.`);
                } else if (field.fieldType === 'Date' && isNaN(Date.parse(value))) {
                    errors.push(`'${field.fieldName}' must be a valid Date string.`);
                } else if (field.fieldType === 'GeoPoint') {
                    if (!value.type || value.type !== 'Point' || !Array.isArray(value.coordinates) || value.coordinates.length !== 2) {
                        errors.push(`'${field.fieldName}' must be a valid GeoJSON Point { type: "Point", coordinates: [lng, lat] }.`);
                    } else if (typeof value.coordinates[0] !== 'number' || typeof value.coordinates[1] !== 'number') {
                        errors.push(`'${field.fieldName}' coordinates must be numbers [longitude, latitude].`);
                    }
                } else if (field.fieldType === 'Address') {
                    if (typeof value !== 'object' || !value.street || !value.city || !value.state || !value.zip) {
                        errors.push(`'${field.fieldName}' must be an object with street, city, state, and zip.`);
                    }
                } else if (field.fieldType === 'ObjectId') {
                    // Check valid 24-character hex string
                    if (!/^[0-9a-fA-F]{24}$/.test(value)) {
                        errors.push(`'${field.fieldName}' must be a valid MongoDB ObjectId (24 hex characters).`);
                    } else if (field.referenceTo) {
                        // Hard Foreign Key Validation!
                        const db = getNativeDB();
                        const targetCol = db.collection(`${projectId}_${field.referenceTo}`);
                        const exists = await targetCol.findOne({ _id: new ObjectId(value) });
                        if (!exists) {
                            errors.push(`Foreign Key Error: '${field.fieldName}' references a document in '${field.referenceTo}' that does not exist.`);
                        }
                    }
                } else if (field.fieldType !== 'Array' && field.fieldType !== 'Date' && field.fieldType !== 'GeoPoint' && field.fieldType !== 'Address' && field.fieldType !== 'ObjectId' && typeof value !== expectedType) {
                    errors.push(`'${field.fieldName}' must be of type ${field.fieldType}.`);
                }

                // 3. Advanced Validations (Enums, Length, Size)
                if (field.fieldType === 'String' && typeof value === 'string') {
                    if (field.enumValues && field.enumValues.length > 0 && !field.enumValues.includes(value)) {
                        errors.push(`'${field.fieldName}' must be one of: [${field.enumValues.join(', ')}].`);
                    }
                    if (field.minLength !== null && field.minLength !== undefined && value.length < field.minLength) {
                        errors.push(`'${field.fieldName}' must be at least ${field.minLength} characters long.`);
                    }
                    if (field.maxLength !== null && field.maxLength !== undefined && value.length > field.maxLength) {
                        errors.push(`'${field.fieldName}' must be at most ${field.maxLength} characters long.`);
                    }
                }

                if (field.fieldType === 'Number' && typeof value === 'number') {
                    if (field.min !== null && field.min !== undefined && value < field.min) {
                        errors.push(`'${field.fieldName}' must be greater than or equal to ${field.min}.`);
                    }
                    if (field.max !== null && field.max !== undefined && value > field.max) {
                        errors.push(`'${field.fieldName}' must be less than or equal to ${field.max}.`);
                    }
                }
            }
        }

        // If there are validation errors, reject the request
        if (errors.length > 0) {
            return res.status(400).json({ success: false, message: 'Schema Validation Failed', errors });
        }

        // Passed validation!
        next();
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error during validation' });
    }
};

module.exports = dynamicValidator;