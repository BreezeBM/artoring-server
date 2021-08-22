require('dotenv').config();

const { Client } = require('@elastic/elasticsearch');

const client = new Client({
  cloud: {
    id: process.env.ELASTIC_SEARCH_CLOUD_ID
  },
  auth: {
    username: process.env.ELASTIC_SEARCH_CLOUD_AUTH_NAME,
    password: process.env.ELASTIC_SEARCH_CLOUD_AUTH_PWD
  }
});

const searchEngine = async (callback, keyword, model) => {
  if (model) {
    client.search({
      index: `${model}`,
      body: keyword[0] !== ''
        ? {
            query: {
              bool: {
                should: [{
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
                }]
              }
            }
          }
        : {
            query: {
              match_all: {}
            }
          }

    }, (error, data) => {
      if (error) {
        callback(error, null);
      } else {
        const { hits: response } = data.body;

        callback(null, response);
      }
    // data.body.hits = 인덱싱된 서칭 결과. 여기서 hits 리스트는 매칭되는 인덱싱리스트.
    // 이 리스트들의 요소중 _source를 들여다 보면 그제서야 진짜 문서들이 보임.
    });
  } else {
    try {
      const teachData = await client.search(keyword[0] !== ''
        ? {
            index: 'career',
            from: 0,
            size: 8,
            body: {
              query: {
                bool: {
                  should: [{
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
                  }]
                }
              }
            }
          }
        : {
            index: 'career',
            from: 0,
            size: 8,
            body: {
              query: {
                match_all: {}
              }
            }
          });

      const { hits: teachQueryResult } = teachData.body;

      const mentorData = await client.search(keyword[0] === ''
        ? {
            index: 'mentor',
            size: 8,
            body: {
              query: {
                bool: {
                  should: [{
                    terms: {
                      name: keyword
                    }
                  }, {
                    terms: {
                      descriptionText: keyword
                    }
                  }, {
                    terms: {
                      tags: keyword
                    }
                  }]
                }
              }
            }
          }
        : {
            index: 'mentor',
            from: 0,
            size: 8,
            body: {
              query: {
                match_all: {}
              }
            }
          });
      const { hits: mentorQueryResult } = mentorData.body;

      const result = { teachQueryResult, mentorQueryResult };
      callback(null, result);
    } catch (e) {
      callback(e, null);
    }
  }
}
;

module.exports = searchEngine;
