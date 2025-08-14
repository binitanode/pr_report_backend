const UserModel = require("../models/userModel");
const { default: ApiError } = require("../errors/ApiError");

class UserRepository {
  async create(userData) {
    try {
      const user = await UserModel.create(userData);
      return user;
    } catch (error) {
      throw ApiError.internal("Error creating user: " + error.message);
    }
  }

  async findById(id) {
    try {
      const user = await UserModel.findById(id);
      return user;
    } catch (error) {
      throw ApiError.internal("Error finding user by ID: " + error.message);
    }
  }

  async findByIdAndPopulate(id) {
    try {
      const user = await UserModel.findById(id)
        .populate("role")
        .populate("permission");
      return user;
    } catch (error) {
      throw ApiError.internal("Error finding user by ID with population: " + error.message);
    }
  }

  async findByEmail(email) {
    try {
      const user = await UserModel.findOne({ email });
      return user;
    } catch (error) {
      throw ApiError.internal("Error finding user by email: " + error.message);
    }
  }

  async findByFirebaseId(firebase_id) {
    try {
      const user = await UserModel.findOne({ firebase_id });
      return user;
    } catch (error) {
      throw ApiError.internal("Error finding user by Firebase ID: " + error.message);
    }
  }

  async findAll() {
    try {
      const users = await UserModel.find({ isDeleted: false });
      return users;
    } catch (error) {
      throw ApiError.internal("Error finding all users: " + error.message);
    }
  }

  async updateById(id, updateData) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        id,
        updateData,
        { new: true, runValidators: true }
      );
      return user;
    } catch (error) {
      throw ApiError.internal("Error updating user: " + error.message);
    }
  }

  async updateByEmail(email, updateData) {
    try {
      const user = await UserModel.findOneAndUpdate(
        { email },
        updateData,
        { new: true, runValidators: true }
      );
      return user;
    } catch (error) {
      throw ApiError.internal("Error updating user by email: " + error.message);
    }
  }

  async deleteById(id) {
    try {
      const user = await UserModel.findByIdAndUpdate(
        id,
        { isDeleted: true },
        { new: true }
      );
      return user;
    } catch (error) {
      throw ApiError.internal("Error deleting user: " + error.message);
    }
  }

  async hardDeleteById(id) {
    try {
      const user = await UserModel.findByIdAndDelete(id);
      return user;
    } catch (error) {
      throw ApiError.internal("Error hard deleting user: " + error.message);
    }
  }

  async exists(email) {
    try {
      const exists = await UserModel.exists({ email, isDeleted: false });
      return exists;
    } catch (error) {
      throw ApiError.internal("Error checking user existence: " + error.message);
    }
  }

  async count() {
    try {
      const count = await UserModel.countDocuments({ isDeleted: false });
      return count;
    } catch (error) {
      throw ApiError.internal("Error counting users: " + error.message);
    }
  }

  async updateMany(filter, updateData) {
    try {
      const result = await UserModel.updateMany(filter, updateData);
      return result;
    } catch (error) {
      throw ApiError.internal("Error updating multiple users: " + error.message);
    }
  }
}

module.exports = new UserRepository();
