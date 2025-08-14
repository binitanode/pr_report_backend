const express = require("express");
const jwtMiddleware = require("../middlewares/jwtMiddleware");
const RoleController = require("../controllers/roleController");
const {
  validateRoleCreation,
  validateRoleUpdate,
  validateRoleId,
  validateRoleQuery
} = require("../validators/roleValidators");
const router = express.Router();

// List all roles
router.get("/getRoles", jwtMiddleware, validateRoleQuery, RoleController.getAllRole);

// Create a new role
router.post("/createRole", jwtMiddleware, validateRoleCreation, RoleController.createRole);

// Update a role
router.put("/updateRole/:id", jwtMiddleware, validateRoleUpdate, RoleController.updateRole);

// Delete a role
router.delete("/deleteRole/:id", jwtMiddleware, validateRoleId, RoleController.deleteRole);

// Get role by ID
router.get("/getRole/:id", jwtMiddleware, validateRoleId, RoleController.getById);

// Permission count
router.get("/permission/count", jwtMiddleware, RoleController.permissionCount);

module.exports = router;
