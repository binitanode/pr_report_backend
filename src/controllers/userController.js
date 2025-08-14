const customError = require("../errors/customError").default;
const { default: ApiError } = require("../errors/ApiError");
const createToken = require("../middlewares/createToken");
const { findById } = require("../models/userModel");
const AuthService = require("../services/authService");

class AuthController {
  async register(req, res, next) {
    try {
      const user = await AuthService.register(req.body);
      res.status(201).json({ message: "User created", user });
    } catch (err) {
      next(customError(err));
    }
  }

  async login(req, res, next) {
    try {
      const { token, user } = await AuthService.login(req.body);
      res.json({ token, user });
    } catch (err) {
      console.log(err);
      next(customError(err));
    }
  }

  async createUser(req, res, next) {
    try {
      const { fullName, email, password, role } = req.body;

      if (!fullName || !email || !password || !role) {
        return res.status(400).json({ message: "All fields are required" });
      }
      const user_name = req.user.fullName || "System";
      const user_id = req.user._id || null;
      const user = await AuthService.createUser({
        fullName,
        email,
        password,
        role,
        user_name,
        user_id,
      });
      res.status(201).json({ message: "User created", user });
    } catch (err) {
      next(customError(err));
    }
  }

  async getUserById(req, res, next) {
    try {
      const user = await AuthService.getUserById(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (err) {
      next(customError(err));
    }
  }

  async updateUser(req, res, next) {
    try {

      if (req.body.password || req.body.email) {
        return res.status(400).json({ message: "Password and email cannot be updated" });
        
      }
      const user = await AuthService.updateUser(req.params.id, req.body);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User updated", user });
    } catch (err) {
      console.log(err);
      next(customError(err));
    }
  }
  async deleteUser(req, res, next) {
    try {
      const user = await AuthService.deleteUser(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted" });
    } catch (err) {
      next(customError(err));
    }
  }
  async getAllUsers(req, res, next) {
    try {
      const users = await AuthService.getAllUsers();
      res.json(users);
    } catch (err) {
      next(customError(err));
    }
  }

  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }
      const user = await AuthService.forgotPassword(email);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "Reset password email sent" });
    } catch (err) {
      next(customError(err));
    }
  }

  async resetPassword(req, res, next) {
    try {
      const { token, newPassword, email, otp, confirmPassword } = req.body;
      if (!token || !newPassword) {
        return res
          .status(400)
          .json({ message: "Token and new password are required" });
      }
      const reset = await AuthService.resetPassword(
        email,
        otp,
        newPassword,
        confirmPassword
      );
      if (reset) {
        res.json({ message: "Password reset successfully" });
      }
    } catch (err) {
      next(customError(err));
    }
  }

  async findById(req, res, next) {
    try {
      const userId = req.user._id;
      if (!userId) {
        return res.status(404).json({ message: "User is missing" });
      }
      const user = await AuthService.findById(userId);
      console.log("user ", user);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(user);
    } catch (err) {
      next(customError(err));
    }
  }

  async getUserDataByFirebaseId(req, res, next) {
    try {
      const { firebase_id } = req.params;
      console.log(firebase_id);
      const user = await AuthService.getUserByFirebaseId(firebase_id);
      return res.status(200).json({ data: user });
    } catch (err) {
      console.log(err);
      return next(
        err instanceof Error ? err : ApiError.internal("Unexpected error")
      );
    }
  }
}

module.exports = new AuthController();
