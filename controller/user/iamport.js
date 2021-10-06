const axios = require('axios');
const { purchaseHistoryModel, mentoringModel, mongoose } = require('../../model');
const { verifyJWTToken, verifyAndCallback } = require('../tools');
// 아임포트 결제이후 결제 내역 검증 및 저장
const post = (req, res) => {
  const { imp_uid, merchant_uid } = req.body;

  const split = req.cookies.authorization.split(' ');
  const accessToken = split[0].concat(' ', split[1]);
  const loginType = split[2];

  const tokenUrl = 'https://api.iamport.kr/users/getToken';
  const paymentUrl = 'https://api.iamport.kr/payments';
  if (loginType === 'email') {
    const decode = verifyJWTToken(req);

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
        // 아임포트 토큰 발급
        axios.post(tokenUrl, { imp_key: process.env.IAMPORT_KEY, imp_secret: process.env.IAMPORT_SEC })
          .then(({ data }) => {
            const { access_token } = data.response;

            // 아임포트 서버 결제 정보 조희
            return axios.get(paymentUrl.concat('/', imp_uid), {
              headers: {
                Authorization: access_token
              }
            });
          })
          .then(({ data }) => {
            const paymentData = data.response;

            const { imp_uid, merchant_uid } = paymentData;

            // 결제 데이터 상호 검증
            return purchaseHistoryModel.findOne({ merchantUid: merchant_uid })
              .then((document) => {
                if (document.price === paymentData.amount) {
                  return purchaseHistoryModel.findOneAndUpdate({ merchantUid: merchant_uid }, { $set: { paymentData, progress: 'paid', questions: req.body.questions } }, { new: true });
                } else { throw new Error({ status: 'forgery', message: '위조된 결제시도' }); }
              });
          })
          .then((document) => {
            switch (document.paymentData.status) {
              case 'paid':
                res.send({ status: 'success', message: '일반 결제 성공' });
                break;
            }
          })
          .catch(e => {
            console.log(e);

            res.status(500).send(e);
          });
      }
    }
  } else {
    verifyAndCallback(() => {
      axios.post(tokenUrl, { imp_key: process.env.IAMPORT_KEY, imp_secret: process.env.IAMPORT_SEC })
        .then(({ data }) => {
          const { access_token } = data.response;

          return axios.get(paymentUrl.concat('/', imp_uid), {
            headers: {
              Authorization: access_token
            }
          });
        })
        .then(({ data }) => {
          const paymentData = data.response;

          const { imp_uid, merchant_uid } = paymentData;

          return purchaseHistoryModel.findOne({ merchantUid: merchant_uid })
            .then((document) => {
              if (document.price === paymentData.amount) {
                return purchaseHistoryModel.findOneAndUpdate({ merchantUid: merchant_uid }, { $set: { paymentData, progress: 'paid', questions: req.body.questions } }, { new: true });
              } else { throw new Error({ status: 'forgery', message: '위조된 결제시도' }); }
            });
        })
        .then((document) => {
          switch (document.paymentData.status) {
            case 'paid':
              res.send({ status: 'success', message: '일반 결제 성공' });
              break;
          }
        })
        .catch(e => {
          console.log(e);

          res.status(500).send(e);
        });
    }, loginType, accessToken, res);
  }
};

// 아임포트 결제 실패 프로세스 핸들러
const remove = async (req, res) => {
  const { merchantUid } = req.params;

  if (!req.cookies.authorization) {
    res.status(401).send();
    return;
  }
  const split = req.cookies.authorization.split(' ');
  const accessToken = split[0].concat(' ', split[1]);
  const loginType = split[2];

  if (!merchantUid) res.status(404).send();
  else if (loginType === 'email') {
    const decode = verifyJWTToken(req);

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
        const session = await purchaseHistoryModel.startSession();
        const transactionOptions = {
          readPreference: 'primary',
          readConcern: { level: 'majority' },
          writeConcern: { w: 'majority' }
        };

        // 예약인원 1 감소 및 결제 데이터 삭제
        await session.withTransaction(() => {
          return purchaseHistoryModel.findOneAndDelete({ merchantUid })
            .then((data) => {
              return mentoringModel.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(data.targetId) }, { $inc: { joinedParticipants: -1 } })
                .then((data) => {
                });
            })
            .catch(e => {
              console.log(e);

              res.status(500).send(e);
            });
        }, transactionOptions);
        res.status(200).send();
        session.endSession();
      }
    }
  } else {
    verifyAndCallback(async () => {
      const session = await purchaseHistoryModel.startSession();
      const transactionOptions = {
        readPreference: 'primary',
        readConcern: { level: 'majority' },
        writeConcern: { w: 'majority' }
      };

      await session.withTransaction(() => {
        return purchaseHistoryModel.findOneAndDelete({ merchantUid })
          .then((data) => {
            return mentoringModel.findByIdAndUpdate({ _id: mongoose.Types.ObjectId(data.targetId) }, { $inc: { joinedParticipants: -1 } })
              .then((data) => {
              });
          })

          .catch(e => {
            console.log(e);

            res.status(500).send(e);
          });
      }, transactionOptions);
      res.status(200).send();
    }, loginType, accessToken, res);
  }
}
;
// 결제 취소 담당 핸들러, 계좌정보등을 받아야 하기 때문에 post 메서드
const revoke = async (req, res) => {
  const { id, reason } = req.body;

  const split = req.cookies.authorization.split(' ');
  const accessToken = split[0].concat(' ', split[1]);
  const loginType = split[2];

  if (loginType === 'email') {
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
        // 결제 정보 확인
        let purchaseData;

        purchaseHistoryModel.findOne({ _id: mongoose.Types.ObjectId(id) })
          .then((data) => {
            // 해당 데이터가 없거나 혹은 이미 환불이 된 경우
            //
            purchaseData = data;

            if (!data || data.isRefund) res.status(404).send();
            else {
              let amount;
              const bookedTime = new Date(data.bookedStartTime);
              bookedTime.setHours(0, 0, 0, 0);

              // 환불 가능 금액 설정 - 다날은 부분취소 불가능함?
              // if (bookedTime.getTime() - 1000 * 3600 * 24 * 2 <= new Date()) {
              //   res.status(400).send();
              //   return;
              // } else if (bookedTime.getTime() - 1000 * 3600 * 24 * 2 > new Date() && bookedTime.getTime() - 1000 * 3600 * 24 * 5 < new Date()) amount = data.price / 2;
              // else if (bookedTime.getTime() - 1000 * 3600 * 24 * 5 >= new Date()) amount = data.price;
              // else {
              //   res.status(501).send();
              //   return;
              // }
              amount = data.price;

              // 아임포트 서버 토큰 발급
              const tokenUrl = 'https://api.iamport.kr/users/getToken';
              const paymentUrl = 'https://api.iamport.kr/payments/cancel';

              return axios.post(tokenUrl, { imp_key: process.env.IAMPORT_KEY, imp_secret: process.env.IAMPORT_SEC })
                .then(({ data: response }) => {
                  const { access_token } = response.response;

                  // 아임포트 PG 환불 요청
                  return axios.post(paymentUrl, {
                    imp_uid: data.paymentData.imp_uid, // 주문번호
                    // amount, // 환불금액
                    reason: 'etc', // 환불사유
                    checksum: data.price
                    // refund_holder: holder, // [가상계좌 환불시 필수입력] 환불 수령계좌 예금주
                    // refund_bank: bank, // [가상계좌 환불시 필수입력] 환불 수령계좌 은행코드(예: KG이니시스의 경우 신한은행은 88번)
                    // refund_account: account // [가상계좌 환불시 필수입력] 환불 수령계좌 번호
                  }, {
                    headers: {
                      Authorization: access_token
                    }
                  }
                  );
                });
            }
          })
          .then(({ data }) => {
            if (!data.response) {
              throw new Error(data.message);
            } else { return purchaseHistoryModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(id) }, { $set: { isRefund: true } }); }
          })
          .then(() => {
            return mentoringModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(purchaseData.targetId) }, { $inc: { joinedParticipants: -1 } });
          })
          .then(() => res.status(200).send())
          .catch(e => {
            console.log(e);
            res.status(500).send();
          });
      }
    }
  } else {
    verifyAndCallback(() => {
      // 결제 정보 확인
      //
      let purchaseData;
      purchaseHistoryModel.findOne({ _id: mongoose.Types.ObjectId(id) })
        .then((data) => {
          // 해당 데이터가 없거나 혹은 이미 환불이 된 경우
          //
          purchaseData = data;
          if (!data || data.isRefund) res.status(404).send();
          else {
            let amount;
            const bookedTime = new Date(data.bookedStartTime);
            bookedTime.setHours(0, 0, 0, 0);

            // 환불 가능 금액 설정
            if (bookedTime.getTime() - 1000 * 3600 * 24 * 2 <= new Date()) {
              res.status(400).send();
              return;
            } else if (bookedTime.getTime() - 1000 * 3600 * 24 * 2 > new Date() && bookedTime.getTime() - 1000 * 3600 * 24 * 5 < new Date()) amount = data.price / 2;
            else if (bookedTime.getTime() - 1000 * 3600 * 24 * 5 >= new Date()) amount = data.price;
            else {
              res.status(501).send();
              return;
            }
            // 아임포트 서버 토큰 발급
            const tokenUrl = 'https://api.iamport.kr/users/getToken';
            const paymentUrl = 'https://api.iamport.kr/payments/cancel';

            return axios.post(tokenUrl, { imp_key: process.env.IAMPORT_KEY, imp_secret: process.env.IAMPORT_SEC })
              .then(({ data: response }) => {
                const { access_token } = response.response;

                // 아임포트 PG 환불 요청
                return axios.post(paymentUrl, {
                  imp_uid: data.paymentData.imp_uid, // 주문번호
                  amount, // 환불금액
                  reason, // 환불사유
                  checksum: data.price
                  // refund_holder: holder, // [가상계좌 환불시 필수입력] 환불 수령계좌 예금주
                  // refund_bank: bank, // [가상계좌 환불시 필수입력] 환불 수령계좌 은행코드(예: KG이니시스의 경우 신한은행은 88번)
                  // refund_account: account // [가상계좌 환불시 필수입력] 환불 수령계좌 번호
                }, {
                  headers: {
                    Authorization: access_token
                  }
                }
                );
              });
          }
        })
        .then(({ data }) => {
          if (!data.response) {
            throw new Error(data.message);
          } return purchaseHistoryModel.findOneAndDelete({ _id: mongoose.Types.ObjectId(id) });
        })
        .then(() => {
          return mentoringModel.findOneAndUpdate({ _id: mongoose.Types.ObjectId(purchaseData.targetId) }, { $inc: { joinedParticipants: -1 } });
        })
        .then(() => res.status(200).send())
        .catch(e => {
          console.log(e);
          res.status(500).send();
        });
    }, loginType, accessToken, res);
  }
};
module.exports = { post, remove, revoke }
;
