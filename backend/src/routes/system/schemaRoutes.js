const express = require("express");
const router = express.Router();

const {
    createApiSchema,
    getApiSchemas,
    updateApiSchema,
    addRelationship,
    deleteRelationship,
    deleteApiSchema
} = require("../../controllers/apiSchema.controller");
const { protect } = require("../../middlewares/protect");

// ─── Schema CRUD ──────────────────────────────────────────────────────────────
router.post("/", protect, createApiSchema);
router.get("/:projectId", protect, getApiSchemas);
router.put("/:apiSchemaId", protect, updateApiSchema);
router.delete("/:apiSchemaId", protect, deleteApiSchema);

// ─── Relationship management (nested under schema) ────────────────────────────
router.post("/:apiSchemaId/relationships", protect, addRelationship);
router.delete("/:apiSchemaId/relationships/:relId", protect, deleteRelationship);

module.exports = router;