const { sign } = require("jsonwebtoken");

const createToken = (user, rememberMe) => {
  const dataStoredInToken = { _id: user._id };
    var expiresIn;
    if (rememberMe) {
      expiresIn = 60 * 60 * 24 * 14;
    } else {
      expiresIn = 60 * 60 * 24;
    }
    console.log("expiresIn", expiresIn);
    const secretkey = process.env.JWT_SECRET_KEY;
    return {
      expiresIn,
      token: sign(dataStoredInToken, secretkey, { expiresIn }),
    };
  }
// };

module.exports = createToken;
