import dotenv from 'dotenv';

import { userModel, adminModel } from '../../model/index.js';
import { tool } from '../tools/index.js';
dotenv.config();
// const { verifyJWTToken, aesDecrypt, AdminAccessException } = require('../tools');

export default async (req, res) => {
  try {
    const decode = await tool.verifyJWTToken(req);
    switch (decode) {
      case 401: {
        res.status(401).send();
        break;
      }
      case 403: {
        res.status(403).send();
        break;
      }
      // verify  성공.
      default: {
        // 어드민 토큰은 항상 유니크한 엑세스 키를 가지고 있어야 하며
        // 엑세스키는 AES256으로 암호화 처리되어 있음.

        const { name, accessKey, authLevel, page } = decode;

        if (!accessKey || authLevel === 0) throw new tool.AdminAccessException('need authorize');

        // AES 암호화된 데이터를 복호하 하여 권한을 검증.
        const accKey = await tool.aesDecrypt(accessKey);

        const adminData = await adminModel.find({ name, accessKey: accKey });
        if (!adminData) throw new tool.AdminAccessException('no match found');

        const mentorData = await userModel.aggregate(req.body.name !== ''
          ? [
              {
                $search: {
                  index: 'searchName',
                  text: {
                    query: `{ name: '${req.body.name}' }`,
                    path: {
                      wildcard: '*'
                    }
                  }
                }
              },
              { $match: { isMentor: req.body.isRegistered } },
              {
                $project: {
                  _id: '$_id',
                  current: '$current',
                  userName: '$name',
                  thumb: '$mentor.thumb'
                }
              },
              {
                $facet: {
                  cardList: [{ $skip: (page - 1) * (req.query.size || 8) }, { $limit: Number(req.query.size) || 8 }],
                  total: [
                    { $project: { users: '$users' } },
                    { $unwind: '$users' },
                    {
                      $group: {
                        _id: null,
                        count: { $sum: 1 }
                      }
                    }]
                }
              }
            ]
          : [
              { $match: { isMentor: req.body.isRegistered } },
              {
                $project: {
                  _id: '$_id',
                  descriptionForMentor: req.body.isRegistered ? '$mentor.descriptionForMentor' : '',
                  descriptionText: req.body.isRegistered ? '$mentor.descriptionText' : '',
                  name: '$name',
                  current: '$current',
                  thumb: '$mentor.thumb'
                }
              },
              {
                $facet: {
                  cardList: [{ $skip: (page - 1) * (req.query.size || 8) }, { $limit: Number(req.query.size) || 8 }],
                  total: [
                    { $project: { users: '$users' } },
                    { $unwind: '$users' },
                    {
                      $group: {
                        _id: null,
                        count: { $sum: 1 }
                      }
                    }]
                }
              }
            ]);

        // mentorData = mentorData.filter(ele => ele._id !== undefined);
        // const total = mentorData.length;
        // if (page) {
        //   mentorData = mentorData.splice((page - 1) * 8, 8);
        // }

        res.status(200).json(mentorData);
      }
        break;
    }
  } catch (e) {
    console.log(e);
    res.status(500).send(e.message);
  }
}
;
