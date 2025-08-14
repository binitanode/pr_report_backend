const RoleModel = require("../models/roleModel");
const UserModel = require("../models/userModel");
const mongoose = require("mongoose");

async function getAllRole(req) {
  const { page = 1, pageSize = 10, search } = req.query;
  const skipCount = (parseInt(page, 10) - 1) * parseInt(pageSize, 10);

  let filter = {};
  if (search) {
    const regex = new RegExp(search, "i");
    filter.$or = [{ name: regex }, { _id: regex }, { permission: regex }];
  }

  const [roles, row_count, total_count] = await Promise.all([
    RoleModel.find(filter).skip(skipCount).limit(parseInt(pageSize, 10)),
    RoleModel.countDocuments(filter),
    RoleModel.countDocuments({}),
  ]);

  return { data: roles, row_count, total_count };
}

async function createRole(req) {
  const { _id, name, permission } = req.body;
  if (!_id || !name || !permission) throw new Error("Missing required fields");
  const exists = await RoleModel.findOne({ $or: [{ _id }, { name }] });
  if (exists) throw new Error("Role already exists");
  const user_name = req.user.fullName;
  const user_id = req.user._id;
  const role = await RoleModel.create({ ...req.body, user_id, user_name });
  return { message: "Role created successfully!", role };
}

async function updateRole(req) {
  const id = req.params.id;
  const { name, permission, updateAll } = req.body;
  if (!name && !permission) throw new Error("Nothing to update");
  const exists = await RoleModel.findOne({ _id: { $ne: id }, name });
  if (exists) throw new Error("Role name already exists");
  const oldRole = await RoleModel.findById(id);
  const updatedRole = await RoleModel.findByIdAndUpdate(id, req.body, {
    new: true,
  });
  if (!updatedRole) throw new Error("Role not found");
  if (updateAll) {
    await UserModel.updateMany(
      { role: id },
      { $set: { type: name, permission } }
    );
  }
  return { message: "Role updated successfully", updatedRole };
}

async function deleteRole(req) {
  const id = req.params.id;
  const inUse = await UserModel.find({ role: id });
  if (inUse.length > 0) throw new Error("Role is already in use");
  const deleted = await RoleModel.findByIdAndDelete(id);
  if (!deleted) throw new Error("Role not found");
  return { message: "Role deleted successfully" };
}

async function getById(req) {
  const id = req.params.id;
  const role = await RoleModel.findById(id);
  if (!role) throw new Error("Role not found");
  return { role };
}

async function permissionCount(req) {
  const aggregate = [
    {
      $project: {
        permissions: {
          $filter: {
            input: { $objectToArray: "$permission" },
            as: "perm",
            cond: {
              $or: [
                { $eq: ["$$perm.v.read", true] },
                { $eq: ["$$perm.v.write", true] },
                { $eq: ["$$perm.v.delete", true] },
              ],
            },
          },
        },
      },
    },
    { $unwind: "$permissions" },
    {
      $group: {
        _id: "$permissions.k",
        count: { $sum: 1 },
      },
    },
  ];
  const data = await RoleModel.aggregate(aggregate);
  return { data };
}

module.exports = {
  getAllRole,
  createRole,
  updateRole,
  deleteRole,
  getById,
  permissionCount,
};
