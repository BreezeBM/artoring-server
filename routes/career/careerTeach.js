const express = require('express');
const { careerController } = require('../../controller');
const router = express.Router();

// 교육, 모임등을 가진 모든 카테고리 정보를 리턴해야 합니다.
router.get('/', careerController.getCard);

// 특정 id (_id 아닙니다)를 가진 문서를 리턴합니다.
router.get('/:id', careerController.getCard);

// 후즈아트관련 요청을 받은경우에 사용합니다.
router.get('/whoseart', () => {});

// 새로운 카드를 등록하는 경우 사용합니다.
router.post('/', careerController.postCard);

// 컨텐츠를 수정하는 경우에 사용합니다.
router.put('/:id', careerController.putCard);

// 하나의 카드를 제거할때 사용합니다.
router.delete('/:id', careerController.deleteCard);

module.exports = router
;
