const jwt = require("jsonwebtoken");
const UserModel = require("../models/userModel");
const admin = require("../configs/firebaseAdmin");

const jwtMiddleware = async (req, res, next) => {
  const jwtToken = req.header("Authorization")?.split("Bearer ")[1] || null;
  const firebaseToken = req.header("Authorization-Token") || null;

  try {
    let user = null;

    if (jwtToken) {
      const secretkey = process.env.JWT_SECRET;
      const decoded = jwt.verify(jwtToken, secretkey);
      console.log("Decoded JWT:", decoded);
      user = await UserModel.findById(decoded.id);
    }

    //  Firebase Token
    else if (firebaseToken) {
      // console.log("Firebase Token:", firebaseToken);
      const decodedFirebase = await admin.auth().verifyIdToken(firebaseToken);
      // console.log("Decoded Firebase Token:", decodedFirebase);
      if (!decodedFirebase?.email) {
        return res.status(401).json({ message: "Invalid Firebase token." });
      }
      user = await UserModel.findOne({ email: decodedFirebase.email });
    }

    else {
      console.log("No token provided");
      return res
        .status(401)
        .json({ message: "Access denied. Token not provided." });
    }

    if (!user) {
      return res.status(401).json({ message: "User Not Found." });
    }

    if (user.isDeleted) {
      return res.status(401).json({ message: "User is deleted." });
    }

    if (user.isBlocked) {
      return res.status(401).json({ message: "User is blocked." });
    }
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

module.exports = jwtMiddleware;
