import dotenv from 'dotenv';

import { Client } from '@elastic/elasticsearch';
dotenv.config();
// const { Client } = require('@elastic/elasticsearch');

// 엘라스틱 서치 연결
const client = new Client({
  cloud: {
    id: process.env.ELASTIC_SEARCH_CLOUD_ID
  },
  auth: {
    username: process.env.ELASTIC_SEARCH_CLOUD_AUTH_NAME,
    password: process.env.ELASTIC_SEARCH_CLOUD_AUTH_PWD
  }
});

// 서치 핸들러
const searchEngine = async (callback, keyword, model, page) => {
  // 모델이 있음 === 상세검색
  if (model) {
    client.search({
      // 엘라스틱서치가 인덱싱을 하고 있는 이름
      index: 'mentoring',

      // 페이지 네이션용, from 만큼 데이터 스킵.
      from: (Number(page) - 1) * 16,

      // 16개의 데이터 리턴
      size: 16,
      body: keyword[0] !== ''
        ? {

            // 키워드 검색 상세 결과를 리턴
            // 소팅 방법 명시. 1순위 최신순, 2순위 유사도 순
            sort: [
              { startDate: { order: 'desc', format: 'strict_date_optional_time_nanos' } }

            ],
            // 엘라스틱서치 문서 쿼리 방법 명시
            query: {
              // true or false
              bool: {
                // 키워드가 포함되어있는경우 true
                should: [{
                  // 리버스 인덱싱에 키워드 필드에 포함된것을 리턴.
                  terms: {
                    detailInfo: keyword
                  }
                }, {
                  terms: {
                    title: keyword
                  }
                }, {
                  terms: {
                    tags: keyword
                  }
                }],
                minimum_should_match: 1,
                // 반드시 있어야 함.
                must: {
                  term: {
                    // 개인 멘토링 유무
                    isGroup: model === 'career'
                  }
                }
              }
            }
          }
        : {
            sort: [
              { startDate: { order: 'desc', format: 'strict_date_optional_time_nanos' } }

            ],
            // 모델 명시 안함 === 전체문서검색 상세 페이지 개인 멘토링 여부만 체크.
            query: {
              bool: {
                must: {
                  term: {
                    isGroup: model === 'career'
                  }
                }
              }
            }
          }

    }, (error, data) => {
      if (error) {
        callback(error, null);
      } else {
        // 구조를 파악하기 쉽게 분해.
        const { hits: response } = data.body;

        callback(null, response);
      }
    // data.body.hits = 인덱싱된 서칭 결과. 여기서 hits 리스트는 매칭되는 인덱싱리스트.
    // 이 리스트들의 요소중 _source를 들여다 보면 그제서야 진짜 문서들이 보임.
    });
  } else {
    // 키워드 검색 페이지에서 사용하게 됨. 개인/집단 멘토링에따라 해당되는 돜먼드들을 2개의 배열로 리턴.
    let teachQueryResult, mentorQueryResult, newsQueryResult;
    client.search(keyword[0] !== ''
      ? {
          index: 'mentoring',
          from: 0,
          size: 8,
          body: {
            track_scores: true,
            sort: [
              { startDate: { order: 'desc', format: 'strict_date_optional_time_nanos' } },
              '_score'
            ],
            query: {
              bool: {
                should: [{
                  terms: {
                    textDetailInfo: keyword
                  }
                }, {
                  terms: {
                    title: keyword
                  }
                }, {
                  terms: {
                    tags: keyword
                  }
                }],
                minimum_should_match: 1,
                must: {
                  term: {
                    isGroup: false
                  }
                }
              }
            }
          }
        }
      : {
          index: 'mentoring',
          from: 0,
          size: 8,
          body: {
            track_scores: true,
            sort: [
              { startDate: { order: 'desc', format: 'strict_date_optional_time_nanos' } },
              '_score'

            ],
            query: {
              bool: {
                must: {
                  term: {
                    isGroup: false
                  }
                }
              }
            }
          }
        })
      .then(data => {
        teachQueryResult = data.body.hits;

        return client.search(keyword[0] !== ''
          ? {
              index: 'mentoring',
              size: 8,
              body: {
                track_scores: true,
                sort: [
                  { startDate: { order: 'desc', format: 'strict_date_optional_time_nanos' } },
                  '_score'

                ],
                query: {
                  bool: {
                    should: [{
                      terms: {
                        title: keyword
                      }
                    }, {
                      terms: {
                        textDetailInfo: keyword
                      }
                    }, {
                      terms: {
                        tags: keyword
                      }
                    }],
                    minimum_should_match: 1,
                    must: {
                      term: {
                        isGroup: true
                      }
                    }
                  }
                }
              }
            }
          : {
              index: 'mentoring',
              from: 0,
              size: 8,
              body: {
                track_scores: true,
                sort: [
                  { startDate: { order: 'desc', format: 'strict_date_optional_time_nanos' } },
                  '_score'

                ],
                query: {
                  bool: {
                    must: {
                      term: {
                        isGroup: true
                      }
                    }
                  }
                }
              }
            });
      })
      .then(data => {
        mentorQueryResult = data.body.hits;

        return client.search(keyword[0] !== ''
          ? {
              index: 'news',
              size: 8,
              body: {
                track_scores: true,
                sort: [
                  { issuedDate: { order: 'desc', format: 'strict_date_optional_time_nanos' } },
                  '_score'
                ],
                query: {
                  bool: {
                    should: [{
                      terms: {
                        textDetailInfo: keyword
                      }
                    }, {
                      terms: {
                        title: keyword
                      }
                    }, {
                      terms: {
                        createrName: keyword
                      }
                    }]
                  }
                }
              }
            }
          : {
              index: 'news',
              from: 0,
              size: 8,
              body: {
                track_scores: true,
                sort: [
                  { issuedDate: { order: 'desc', format: 'strict_date_optional_time_nanos' } },
                  '_score'
                ]
              }
            });
      })
      .then(data => {
        newsQueryResult = data.body.hits;
        callback(null, { teachQueryResult, mentorQueryResult, newsQueryResult });
      })
      .catch(e => callback(e, null));
  }
}
;

export default searchEngine;
