import "dotenv/config";

export default {
  secret: process.env.APP_SECRET,
  expiresIn: process.env.TOKEN_VALIDITY,
};
