const { userModel } = require("../../model");
const { verifyJWTToken } = require("../tools");

module.exports = async (req, res) => {
  const decode = await verifyJWTToken(req);

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
        const { email, name } = decode;
        const likeData = await userModel.findOne({ email, name })
          .populate("likedCarrerEdu")
          .populate("likedMentor")
          .selcet({ likedCarrerEdu: 1, likedMentor: 1, _id: 0 });
        res.status(200).json(...likeData);
      } catch (err) {
        console.error(err);
        res.status(401).send({ message: "AccessToken doesnt exist!" });
      }
    }
  }
};
