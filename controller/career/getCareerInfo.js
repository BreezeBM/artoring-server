import { careerInfoModel, mongoose } from '../../model/index.js';

require('dotenv').config();

export default async (req, res) => {
  try {
    // 특정 카드의 상세 데이터 요청시
    if (req.params.id) {
      const data = await careerInfoModel.findOne({ _id: mongoose.Types.ObjectId(req.params.id) });
      res.json(data);
      // 카드 리스트들을 요청시
    } else if (Object.keys(req.query).length === 0) {
      const data = await careerInfoModel.countDocuments();
      res.status(200).json({ total: data });
    } else {
      const query = {};
      const option = { issuedDate: -1, skip: 0, limit: 6 };
      if (req.query.orderby) {
        const order = req.query.orderby;

        // 최신순 - 내림차순
        if (order === 'new') option.sort = { issuedDate: -1 };

        // 오래된순 - 오름차순
        else if (order === 'old') option.sort = { issuedDate: 1 };

        // 인기순 - 내림차순
        else option.sort = { likesCount: 1 };
      }
      // 페이지네이션에 필요한 페이지 요청시
      if (req.query.page) {
        // (req.query.page - 1) * 16 개를 뛰어넘고
        option.skip = (req.query.page - 1) * 9;

        // 이후 16개를 쿼리한다.
        option.limit = 9;
      }
      // 리턴되는 문서의 크기정보가 있다면, 그만큼의 데이터를 전송한다.
      if (req.query.size) option.limit = Number(req.query.size);

      const data = await careerInfoModel.find(query, null, option);
      res.status(200).json({ cardList: data });
    }
  } catch (e) {
    console.log(e);
    res.status(500).send();
  }
}
;
