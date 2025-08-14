const customError = require("../errors/customError");
const RoleService = require("../services/roleService");

class RoleController {
    async getAllRole(req, res, next) {
    try {
      const result = await RoleService.getAllRole(req);
      res.status(200).json(result);
    } catch (err) {
      next(customError(err));
    }
  }

    async createRole(req, res, next) {
    try {
      const result = await RoleService.createRole(req);
      res.status(201).json(result);
    } catch (err) {
      next(customError(err));
    }
  }

    async updateRole(req, res, next) {
    try {
      const result = await RoleService.updateRole(req);
      res.status(200).json(result);
    } catch (err) {
      next(customError(err));
    }
  }

    async deleteRole(req, res, next) {
    try {
      const result = await RoleService.deleteRole(req);
      res.status(200).json(result);
    } catch (err) {
      next(customError(err));
    }
  }

    async getById(req, res, next) {
    try {
      const result = await RoleService.getById(req);
      res.status(200).json(result);
    } catch (err) {
      next(customError(err));
    }
  }

    async permissionCount(req, res, next) {
    try {
      const result = await RoleService.permissionCount(req);
      res.status(200).json(result);
    } catch (err) {
      next(customError(err));
    }
  }
}

module.exports = new RoleController();
