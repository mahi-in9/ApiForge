const express = require("express");

const router = express.Router();

const {createApiSchema, getApiSchemas, deleteApiSchema} = require("../../controllers/apiSchema.controller");
const {protect} = require("../../middlewares/auth.middleware");

router.post("/", protect, createApiSchema);
router.get("/:projectId", protect, getApiSchemas);
router.delete("/:apiSchemaId", protect, deleteApiSchema);

module.exports = router;