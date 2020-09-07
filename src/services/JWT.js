const jwt = require("jsonwebtoken");

const jwtKey = process.env.JWT_KEY;

const TokenGenerator = (email) => {
  const token = jwt.sign(
    {
      sub: "admin",
      email
    },
    jwtKey,
    {
      expiresIn: "5 hours"
    }
  );
  return token;
};



exports.validateToken = token => {
  try {
    const data = jwt.verify(token, process.env.JWT_KEY);
    return data;
  } catch (e) {
    console.error(e);
    return false;
  }
};

exports.TokenGenerator = TokenGenerator;

