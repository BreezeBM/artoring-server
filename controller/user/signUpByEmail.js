const { userModel } = require('../../model');
const { verifyJWTToken } = require('../tools');

module.exports = async (req, res) => {    

    const {email, name, gender, birth, mobile, address, password } = req.body
    const salt = crypto.randomBytes(128).toString('base64');
    const hashPassword = crypto.createHash('sha512').update(password + salt).digest('hex');



    if(email) {
        const data = await userModel.find({ email: email })
        if(data){
            res.status(200).send({message : "이미 가입된 이메일입니다."})
        } else {
            const insertData = await userModel.create({ email: email, name: name, gender: gender, birth: birth, mobile: mobile, address: address, password: hashPassword});
            res.status(201).send({ message : "가입 되었습니다." })
        }
    } else {
        res.send({message : "Invalid Access"})
    }



}