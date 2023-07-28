const { verify } = require("jsonwebtoken");

/**
 * This function is used for authentication of user, if the user is authorized, then he can access
 * the protected route
 * @param {object} req request object of express
 * @param {object} res res object of express
 * @param {function} next
 */
const isAuth = (req, res, next) => {
  // grab the authorization header, if there was not any then throw error
  const authorization = req.headers["authorization"];
  if (!authorization) {
    return res.staus(200).json({ msg: "You need to login." });
    throw new Error("");
  }
  //  grab the token without Bear prefix : xxxx... then verify the authentication of that

  const token = authorization.split(" ")[1];
  const { userId } = verify(token, process.env.ACCESS_TOKEN_SECRET);
  // if there wasn't any userr then send an error, otherwise add the userID (here email) for further operations.
  if (!userId) {
    return res.status(400).json({ msg: "Wrong auth." });
    throw new Error("");
  }
  req.userId = userId;

  next();
};

module.exports = {
  isAuth,
};
