const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const createToken = require("../middlewares/createToken");
const { default: customError } = require("../errors/customError");
const admin = require("../configs/firebaseAdmin");
const { default: ApiError } = require("../errors/ApiError");
const userRepository = require("../repositories/userRepository");
const roleRepository = require("../repositories/roleRepository");

async function register({ fullName, email, password, role, user_type }) {
  try {
    const hash = await bcrypt.hash(password, 10);
    let roleDoc;
    
    if (role) {
      roleDoc = await roleRepository.findById(role);
      if (!roleDoc) {
        throw ApiError.badRequest("Role not found");
      }
    }
    
    const userData = {
      fullName,
      email,
      password: hash,
      user_type
    };
    
    if (roleDoc) {
      userData.role = roleDoc._id;
      userData.permission = roleDoc.permission;
    }
    
    const user = await userRepository.create(userData);
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal("Error during user registration: " + error.message);
  }
}

async function login({ email, password }) {
  try {
    // Update last login
    await userRepository.updateByEmail(email, { lastLogin: new Date() });
    
    // Find user
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw ApiError.badRequest("Invalid credentials");
    }
    
    // Check password
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw ApiError.badRequest("Invalid credentials");
    }
    
    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" }
    );
    
    const userObj = user.toObject();
    delete userObj.password;
    return { token, user: userObj };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal("Error during user login: " + error.message);
  }
}

async function createUser({
  fullName,
  email,
  password,
  role,
  user_name,
  user_id,
  user_type,
  profile_image,
  avatar,
}) {
  try {
    // Check if user exists
    const exists = await userRepository.exists(email);
    if (exists) {
      throw ApiError.badRequest("Email already exists");
    }

    // Check if role exists
    const roleDoc = await roleRepository.findById(role);
    if (!roleDoc) {
      throw ApiError.badRequest("Role not found");
    }

    const hash = await bcrypt.hash(password, 10);

    const userData = {
      fullName,
      email,
      password: hash,
      role: roleDoc._id,
      permission: roleDoc.permission,
      user_name,
      user_id,
      user_type,
      profile_image,
      avatar,
    };

    const user = await userRepository.create(userData);
    const userObj = user.toObject();
    delete userObj.password;
    return userObj;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal("Error creating user: " + error.message);
  }
}
async function getUserById(id) {
  try {
    const user = await userRepository.findByIdAndPopulate(id);
    if (!user) {
      throw ApiError.badRequest("User not found");
    }
    return user;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal("Error getting user by ID: " + error.message);
  }
}

async function verifyToken(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (error) {
    throw ApiError.unauthorized("Invalid token");
  }
}

async function getAllUsers() {
  try {
    const users = await userRepository.findAll();
    return users;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal("Error getting all users: " + error.message);
  }
}

async function updateUser(id, data) {
  if (!id) throw ApiError.badRequest("User ID is required");
  if (!data) throw ApiError.badRequest("User data is required");
  let alreadyemailexist;
  if (data.email) {
    alreadyemailexist = await userRepository.exists(data.email.toLowerCase());
    data.email = data.email.toLowerCase();
  }

  if (alreadyemailexist) {
    throw ApiError.badRequest("Email already exists");
  }

  let flag1 = false;
  let flag2 = false;

  const isExist = await userRepository.findById(id);
  if (!isExist) {
    throw ApiError.badRequest("User Not Found!");
  }

  if (data.newPassword && data.newPassword != "") {
    if (!data.confirmPassword || data.newPassword !== data.confirmPassword) {
      throw ApiError.badRequest("Passwords do not match");
    }
    const hashedPassword = await bcrypt.hash(data.newPassword, 10);
    data.password = hashedPassword;
    await admin
      .auth()
      .updateUser(isExist.firebase_id, { password: newPassword });
  }

  if (data.role) {
    flag1 = true;
    const getRole = await roleRepository.findById(data.role);
    if (getRole) {
      data.type = getRole.name;
    }
  }

  if (data.permission) {
    let result = await roleRepository.findOne({
      name: isExist.type,
      permission: data.permission,
    });
    if (result) {
      data.role = result._id;
      delete data.permission;
    }
  }

  if (data.fullName) {
    flag2 = true;
    if (data.fullName !== isExist.fullName) {
      // const logsData = await LogModel.find({ "user._id": id });
      // if (logsData) {
      //   await LogModel.updateMany(
      //     { user_id: id },
      //     { $set: { name: data.fullName } },
      //     {
      //       arrayFilters: [{ user_id: id }],
      //     }
      //   );
      // }
      updateUserAllModule(data);
    }
  }

  let message = "Updated data successfully ";

  if (data.isDeleted != undefined) {
    message = data.isDeleted ? "User inactivated" : "User activated";
    await admin
      .auth()
      .updateUser(isExist.firebase_id, { disabled: data.isDeleted });
    await admin.auth().revokeRefreshTokens(isExist.firebase_id);
  }

  try {
    const updateUser = await userRepository.updateById(id, data);
    if (!updateUser) throw ApiError.badRequest("User not found");
    
    const userdata = await userRepository.findByIdAndPopulate(id);
    let resultData = { ...userdata._doc };
    if (
      resultData.permission &&
      Object.keys(resultData.permission).length > 0
    ) {
      resultData.role.permission = resultData.permission;
      delete resultData.permission;
    }
    return { message, data: resultData };
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal("Error updating user: " + error.message);
  }
}

async function updateUserAllModule(data) {
  try {
    // Update user
    await userRepository.updateById(data._id, { fullName: data.fullName });
    
    // Update PR distributions
    const prDistributionRepo = require("../repositories/prDistributionRepository");
    await prDistributionRepo.updateMany(
      { "uploaded_by._id": data._id },
      {
        $set: {
          uploaded_by: {
            name: data.fullName,
            email: data.email,
            _id: data._id,
          },
        },
      }
    );
    
    // Update PR distribution groups
    const prDistributionGroupRepo = require("../repositories/prDistributionGroupRepository");
    await prDistributionGroupRepo.updateMany(
      { "uploaded_by._id": data._id },
      {
        $set: {
          uploaded_by: {
            name: data.fullName,
            email: data.email,
            _id: data._id,
          },
        },
      }
    );
    
    // Update roles
    await roleRepository.updateMany(
      { user_id: data._id },
      { $set: { user_name: data.fullName, user_id: data._id } }
    );
  } catch (error) {
    console.log("error in updateUserAllModule in userController", error);
    throw ApiError.internal("Error updating user across modules: " + error.message);
  }
}

async function deleteUser(id) {
  try {
    const user = await userRepository.deleteById(id);
    if (!user) throw ApiError.badRequest("User not found");
    return user;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw ApiError.internal("Error deleting user: " + error.message);
  }
}

async function findById(userId) {
  console.log("llllllllllllllllllllllllll");
  console.log("userId:--", userId);
  try {
    if (!userId) throw ApiError.badRequest("User ID is required");
    const userData = await userRepository.findByIdAndPopulate(userId);
    if (!userData) throw ApiError.badRequest("User not found");

    let resultData = { ...userData._doc };
    const Token = createToken(userData);

    if (
      resultData.permission &&
      Object.keys(resultData.permission).length > 0
    ) {
      console.log("resultData.permission", resultData.permission);
      resultData.role.permission = resultData.permission;
      // delete resultData.permission;
    }
    console.log("resultData in findById in userController", resultData);
    const obj = {
      fullName: resultData.fullName,
      email: resultData.email,
      _id: resultData._id,
      role: resultData.role,
      permission: resultData.permission,
    };

    return {
      user: obj,
      token: Token.token,
      expiresIn: Token.expiresIn,
    };
  } catch (error) {
    console.log("error in findById in userController", error);
    throw customError(error);
  }
}

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000);
}

async function forgotPassword(req, res) {
  try {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw ApiError.badRequest("Email not found");
    }
    if (user.isDeleted) {
      throw ApiError.badRequest("User is deleted");
    }
    const otp = generateOTP();
    await userRepository.update(user._id, { $set: { otp: otp } });

    sendResetEmail(user.email, user.fullName, otp);

    return true;
  } catch (error) {
    next(error);
  }
}
async function sendResetEmail(email, recipientName, otp) {
  console.log("sendResetEmail call");

  const transporter = nodemailer.createTransport({
    host: "records.guestpostlinks.net",
    port: 465,
    auth: {
      user: process.env.SENDER_EMAIL,
      pass: process.env.SENDER_PASSWORD,
    },
  });

  const mailOptions = {
    from: process.env.SENDER_EMAIL,
    to: email,
    subject: "Password Reset for PR Account",
    html: `
      <style>
        body {
          font-family: 'Arial', sans-serif;
          line-height: 1.6;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          padding: 20px;
          border: 1px solid #ddd;
          border-radius: 5px;
          background-color: #f9f9f9;
        }
        p {
          margin-bottom: 15px;
        }
        a {
          color: #007BFF;
          text-decoration: none;
          font-weight: bold;
        }
      </style>
      <div class="container">
        <p>Dear ${recipientName},</p>
        <p>We received a request to reset your password for your PR account. If you did not make this request, please ignore this email.</p>
        <p>Your OTP for password reset is: ${otp}.</p>
        <p>If you have any questions or need further assistance, please contact our support team at <a href="mailto:gpl_sendmail@records.guestpostlinks.net">gpl_sendmail@records.guestpostlinks.net</a>.</p>
        <p>Thank you for using GuestPostLinks!</p>
        <p>Best regards,<br/>The GuestPostLinks Team</p>
      </div>
    `,
  };
  // Send the email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent:", info.response);
    }
  });
}

async function resetPassword(req, res) {
  try {
    console.log("resetPassword req.body", req.body);

    const { email, otp, newPassword, confirmPassword } = req.body;

    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw ApiError.badRequest("User not found");
    }
    if (user.isDeleted) {
      throw ApiError.badRequest("User is deleted");
    }

    if (parseInt(otp) != parseInt(user.otp)) {
      throw ApiError.badRequest("Invalid OTP");
    }

    if (newPassword !== confirmPassword) {
      throw ApiError.badRequest("Passwords do not match");
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await userRepository.update(user._id, { $set: { password: hashedPassword, otp: 0 } });
    return true;
  } catch (error) {
    console.error("Error in reset password:", error);
    next(customError(error));
  }
}

async function getUserByFirebaseId(firebase_id) {
  if (!firebase_id) throw ApiError.badRequest("firebase_id is required");

  const user = await userRepository.findByFirebaseId(firebase_id);

  if (!user) throw ApiError.notFound("User not found");

  if (user.isDeleted) throw ApiError.notFound("User is deleted");

  return user;
}

module.exports = {
  register,
  login,
  verifyToken,
  createUser,
  getUserById,
  getAllUsers,
  updateUser,
  deleteUser,
  findById,
  forgotPassword,
  resetPassword,
  getUserByFirebaseId,
};
