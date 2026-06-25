const ApiSchema = require('../models/apiSchema.model');

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
        schema.fields.forEach(field => {
            const value = payload[field.fieldName];

            // 1. Check Required Fields
            if (field.isRequired && (value === undefined || value === null || value === '')) {
                errors.push(`'${field.fieldName}' is required.`);
                return;
            }

            // 2. Check Data Types (only if a value was provided)
            if (value !== undefined && value !== null) {
                const typeMap = {
                    'String': 'string',
                    'Number': 'number',
                    'Boolean': 'boolean',
                    'Array': 'object', // typeof [] is 'object'
                    'Object': 'object',
                    'Date': 'string' // Dates are usually passed as ISO strings in JSON
                };

                const expectedType = typeMap[field.fieldType];
                
                if (field.fieldType === 'Array' && !Array.isArray(value)) {
                    errors.push(`'${field.fieldName}' must be an Array.`);
                } else if (field.fieldType === 'Date' && isNaN(Date.parse(value))) {
                    errors.push(`'${field.fieldName}' must be a valid Date string.`);
                } else if (field.fieldType !== 'Array' && field.fieldType !== 'Date' && typeof value !== expectedType) {
                    errors.push(`'${field.fieldName}' must be of type ${field.fieldType}.`);
                }
            }
        });

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