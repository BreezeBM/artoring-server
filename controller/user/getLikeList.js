const { userModel } = require("../../model");
const { verifyJWTToken, verifyAndCallback } = require("../tools");

module.exports = async (req, res) => {
  const accessToken = req.headers.authorization;

  try {
    if (type === "email") {
      const decode = await verifyJWTToken(req);

      switch (decode) {
        case 401: {
          res.status(401).send();
          break;
        }
        case 403: {
          res.status(403).send();
          break;
        }
        default: {
          const { email, name } = decode;
          const data = await userModel.findOne({ email, name }).select({
            likedCareerEdu: 1,
            likedMentor: 1,
          });
          res.json(data);
        }
      }
    } else {
      verifyAndCallback(
        async (responseData) => {
          const userInfo = await userModel.findOne({
            email: responseData.email,
          }).select({ likedCareerEdu: 1, likedMentor: 1 });

          res.status(200).json(userInfo);
        },
        type,
        accessToken,
        res,
      );
    }
  } catch (e) {
    console.log(e.message);
    res.status(400).send("acessToken doesn't exist.");
  }
};
