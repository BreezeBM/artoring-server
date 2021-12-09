// 멘토회원의 정산 관련 정보 업데이트 핸들링
import { purchaseHistoryModel, mentoringModel } from '../../model';
import { tool as tools, date } from '../tools/index';

const postSettleReg = async (req, res) => {
  if (!req.cookies.authorization) {
    res.status(200).json({ code: 401, message: 'not authorized' });

    return;
  }
  const split = req.cookies.authorization.split(' ');
  const accessToken = split[0].concat(' ', split[1]);
  const type = split[2];

  try {
    if (type === 'email') {
      const decode = await tools.verifyJWTToken(req);

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
          const { id, isGroup } = req.body;

          const targetModel = isGroup ? mentoringModel : purchaseHistoryModel;

          targetModel.findByIdAndUpdate(id, { $set: { settlementInfo: { progress: 0, createdAt: new Date(date().add(9, 'hours').format()), detailInfo: '' } } });
        }
      }
    } else {
      tools.verifyAndCallback(async () => {
        const { id, isGroup } = req.body;

        const targetModel = isGroup ? mentoringModel : purchaseHistoryModel;

        targetModel.findByIdAndUpdate(id, { $set: { settlementInfo: { progress: 0, createdAt: new Date(date().add(9, 'hours').format()), detailInfo: '' } } });
      }, type, accessToken, res);
    }
  } catch (e) {
    console.log(e.message);
    res.status(400).send();
  }
};

export default postSettleReg;
