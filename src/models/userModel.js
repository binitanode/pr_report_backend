const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true },
    status: { type: String, default: "active" },
    isBlocked: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    permission: { type: Object, default: {} },
    user_name: { type: String },
    user_id: { type: String },
    user_type: { type: String },
    lastLogin: { type: Date },
    otp: { type: Number },
    firebase_id: { type: String },
    profile_image: { type: String },
    avatar: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
