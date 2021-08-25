require("dotenv").config();

module.exports = async (req, res) => {
  const decode = await verifyJWTToken(req);
  const saltRounds = Number(process.env.SALT_ROUNDS);
  switch (decode) {
    case 401: {
      res.staus(401).send();
      break;
    }
    case 403: {
      res.staus(403).send();
      break;
    }
    default: {
      try {
      } catch (error) {}
    }
  }
};
