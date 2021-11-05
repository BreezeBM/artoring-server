import { reviewModel } from '../../model/index.js';

export default async (req, res) => {
  // 배열정보가 URI인코된 상태로 들어옵니다.
  const ids = JSON.parse(decodeURIComponent(req.params.cardids));

  // 몽고디비 쿼리를 이용하여 배열로전달받은 모든 일치하는 데이터들을 반환.
  const reviews = await reviewModel.find({ _id: { $in: ids } });

  res.json(reviews);
}
;
