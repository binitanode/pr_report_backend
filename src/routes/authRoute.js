const express = require("express");
const jwtMiddleware = require("../middlewares/jwtMiddleware");
const AuthController = require("../controllers/userController");
const {
  validateUserRegistration,
  validateUserLogin,
  validateUserUpdate,
  validateUserId,
  validateUserQuery,
  validateForgotPassword,
  validateResetPassword,
} = require("../validators/userValidators");
const router = express.Router();

router.post("/register", validateUserRegistration, AuthController.register);

router.post("/login", validateUserLogin, jwtMiddleware, AuthController.login);

router.post(
  "/createuser",
  jwtMiddleware,
  validateUserRegistration,
  AuthController.createUser
);

router.get(
  "/getuser/:id",
  jwtMiddleware,
  validateUserId,
  AuthController.getUserById
);

router.get(
  "/getallusers",
  jwtMiddleware,
  validateUserQuery,
  AuthController.getAllUsers
);

router.put(
  "/updateuser/:id",
  jwtMiddleware,
  validateUserUpdate,
  AuthController.updateUser
);

router.delete(
  "/deleteuser/:id",
  jwtMiddleware,
  validateUserId,
  AuthController.deleteUser
);

router.post(
  "/forgotpassword",
  validateForgotPassword,
  AuthController.forgotPassword
);

router.post(
  "/resetpassword",
  validateResetPassword,
  AuthController.resetPassword
);

router.get("/users/me", jwtMiddleware, AuthController.findById);

router.get(
  "/getuserdatabyfirebaseid/:firebase_id",
  jwtMiddleware,
  AuthController.getUserDataByFirebaseId
);

module.exports = router;
