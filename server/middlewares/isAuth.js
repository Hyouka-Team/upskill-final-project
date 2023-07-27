const { verify } = require("jsonwebtoken");

const isAuth = (req, res, next) => {
  const authorization = req.headers["authorization"];
  if (!authorization) {
    return res.staus(200).json({ msg: "You need to login." });
    throw new Error("");
  }
  // Based on 'Bearer ksfljrewori384328289398432'
  const token = authorization.split(" ")[1];
  const { userId } = verify(token, process.env.ACCESS_TOKEN_SECRET);

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
