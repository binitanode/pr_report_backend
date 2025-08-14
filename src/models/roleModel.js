const { Schema, model } = require("mongoose");

const MySchema = new Schema(
  {
    _id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    permission: {
      type: Object,
      required: true,
    },
    user_id: {
      type: String,
    },
    user_name: {
      type: String,
    },
  },
  { timestamps: true }
);

const RoleModel = model("role", MySchema);

module.exports = RoleModel;
