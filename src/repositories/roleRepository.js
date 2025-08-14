const RoleModel = require("../models/roleModel");
const { default: ApiError } = require("../errors/ApiError");

class RoleRepository {
  async create(roleData) {
    try {
      const role = await RoleModel.create(roleData);
      return role;
    } catch (error) {
      throw ApiError.internal("Error creating role: " + error.message);
    }
  }

  async findById(id) {
    try {
      const role = await RoleModel.findById(id);
      return role;
    } catch (error) {
      throw ApiError.internal("Error finding role by ID: " + error.message);
    }
  }

  async findByName(name) {
    try {
      const role = await RoleModel.findOne({ name });
      return role;
    } catch (error) {
      throw ApiError.internal("Error finding role by name: " + error.message);
    }
  }

  async findAll() {
    try {
      const roles = await RoleModel.find();
      return roles;
    } catch (error) {
      throw ApiError.internal("Error finding all roles: " + error.message);
    }
  }

  async updateById(id, updateData) {
    try {
      const role = await RoleModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      return role;
    } catch (error) {
      throw ApiError.internal("Error updating role: " + error.message);
    }
  }

  async deleteById(id) {
    try {
      const role = await RoleModel.findByIdAndDelete(id);
      return role;
    } catch (error) {
      throw ApiError.internal("Error deleting role: " + error.message);
    }
  }

  async exists(name) {
    try {
      const exists = await RoleModel.exists({ name });
      return exists;
    } catch (error) {
      throw ApiError.internal("Error checking role existence: " + error.message);
    }
  }

  async count() {
    try {
      const count = await RoleModel.countDocuments();
      return count;
    } catch (error) {
      throw ApiError.internal("Error counting roles: " + error.message);
    }
  }

  async findByUserId(userId) {
    try {
      const role = await RoleModel.findOne({ user_id: userId });
      return role;
    } catch (error) {
      throw ApiError.internal("Error finding role by user ID: " + error.message);
    }
  }

  async updateMany(filter, updateData) {
    try {
      const result = await RoleModel.updateMany(filter, updateData);
      return result;
    } catch (error) {
      throw ApiError.internal("Error updating multiple roles: " + error.message);
    }
  }
}

module.exports = new RoleRepository();
