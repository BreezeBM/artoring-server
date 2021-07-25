const { userModel } = require('../../model');
const { verifyJWTToken } = require('../tools');

module.exports = async (req, res) => {    

    const {email, name, gender, birth, mobile, address, password } = req.body



    if(email) {
        const data = await userModel.find({ email: email })
        if(data){
            res.status(200).send({message : "이미 가입된 이메일입니다."})
        }
    }


}