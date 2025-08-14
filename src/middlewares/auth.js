const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");

async function authMiddleware(req, res, next) {
  res.setHeader(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, private"
  );
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  const Authorization = req.header("Authorization")
    ? req.header("Authorization").split("Bearer ")[1]
    : null;
  console.log(Authorization);
  if (!Authorization) {
    return res
      .status(401)
      .json({ message: "Access denied. Token not provided." });
  }
  try {
    const secretkey = process.env.JWT_SECRET;
    const decoded = await jwt.verify(Authorization, secretkey);
    console.log("Decoded JWT:", decoded);
    const userId = decoded.id;
    console.log("Decoded user ID:", userId);
    const findUser = await UserModel.findById(userId).populate("role");
    if (findUser.role._id != process.env.ADMIN_ID) {
      return res.status(401).json({ message: "Access denied." });
    }
    req.user = findUser;
    if (!req.user) {
      return res.status(401).json({ message: "User Not Found." });
    }
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token." });
  }
}

async function verifyClientKey(req, res, next) {
  const clientKey = req.headers["x-api-key"];
  if (!clientKey || clientKey !== process.env.CLIENT_KEY) {
    return next(
      customError({ statusCode: 401, message: "Invalid or missing API key" })
    );
  }
  next();
}

module.exports = { authMiddleware, verifyClientKey };
