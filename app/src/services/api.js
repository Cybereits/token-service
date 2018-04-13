import { stringify } from 'qs';
import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';
import { errorMesage } from '../utils/networkErrorMsg';
import request from '../utils/request';
import { toGql } from '../utils/utils';

const client = new ApolloClient({
  uri: 'http://192.168.3.200:8010/graphql',
});

export async function queryProjectNotice() {
  return request('/api/project/notice');
}

export async function queryActivities() {
  return request('/api/activities');
}

export async function queryRule(params) {
  return request(`/api/rule?${stringify(params)}`);
}

export async function removeRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'delete',
    },
  });
}

export async function addRule(params) {
  return request('/api/rule', {
    method: 'POST',
    body: {
      ...params,
      method: 'post',
    },
  });
}

export async function fakeSubmitForm(params) {
  return request('/api/forms', {
    method: 'POST',
    body: params,
  });
}

export async function fakeChartData() {
  return request('/api/fake_chart_data');
}

export async function queryTags() {
  return request('/api/tags');
}

export async function queryBasicProfile() {
  return request('/api/profile/basic');
}

export async function queryAdvancedProfile() {
  return request('/api/profile/advanced');
}

export async function queryFakeList(params) {
  return request(`/api/fake_list?${stringify(params)}`);
}

export async function fakeAccountLogin(params) {
  return request('/api/login/account', {
    method: 'POST',
    body: params,
  });
}

export async function fakeRegister(params) {
  return request('/api/register', {
    method: 'POST',
    body: params,
  });
}

export async function queryNotices() {
  return request('/api/notices');
}

export async function getAccountList() {
  return client
    .query({
      query: gql`
        {
          getAccountList
        }
      `,
    })
    .catch(err => {
      console.log(err);
    });
}

export async function queryAllBalance({ pageIndex, pageSize, filter }) {
  console.log(JSON.stringify(filter));
  const newFilter = { ...filter };
  for (const key in newFilter) {
    if (filter[key] === undefined) {
      delete newFilter[key];
    } else if (key === 'ethAddresses') {
      newFilter[key] = [newFilter[key]];
    }
  }
  return client
    .query({
      fetchPolicy: 'network-only',
      query: gql`
        {
          queryAllBalance(pageIndex: ${pageIndex},pageSize: ${pageSize}, filter: ${toGql(
        newFilter
      )}) {
            pagination {
              total
              current
              pageSize
              pageCount
            }
            list {
              ethAddress
              balances {
                name
                value
              }
            }
          }
        }
      `,
    })
    .catch(err => {
      console.log(err.message);
      errorMesage(err.message);
    });
}

export async function addWallet() {
  return client
    .mutate({
      fetchPolicy: 'no-cache',
      mutation: gql`
        mutation {
          createAccount
        }
      `,
    })
    .catch(err => {
      errorMesage(err.message);
    });
}

export async function createMultiAccount(parmas) {
  console.log(parmas);
  console.log(typeof parmas.walletAmount);
  return client
    .mutate({
      fetchPolicy: 'no-cache',
      mutation: gql`mutation {
      createMultiAccount(amount: ${parmas.walletAmount})
    }`,
    })
    .catch(err => {
      errorMesage(err.message);
    });
}

export async function queryPrizeList({ pageIndex, pageSize, filter }) {
  const newFilter = { ...filter };
  for (const key in newFilter) {
    if (filter[key] === undefined) {
      delete newFilter[key];
    }
  }
  return client
    .query({
      fetchPolicy: 'network-only',
      query: gql`
        {
          queryPrizeList(pageIndex: ${pageIndex},pageSize: ${pageSize}, filter: ${toGql(
        newFilter
      )}) {
            pagination {
              total
              current
              pageSize
              pageCount
            }
            list {
              ethAddress
              prize
              status
              type
              txid
            }
          }
        }
      `,
    })
    .catch(err => {
      console.log(err.message);
      console.log(err.name);
      errorMesage(err.message);
    });
}

// export async function createMultiAccount(parmas) {
//   return client.mutate({
//     fetchPolicy: "no-cache",
//     mutation: gql`mutation {
//       createMultiAccount(amount: ${parmas.walletAmount})
//     }`,
//   }).catch(err => {
//     errorMesage(err.message)
//   });
// }

// export async function handlePrizes(params) {
//   const param = { ...params }
//   for (const key in param) {
//     if (param[key] === undefined) {
//       delete param[key]
//     }
//   }
//   console.log(toGql(param))
//   return client
//     .query({
//       fetchPolicy: "no-cache",
//       mutation: gql`mutation {
//         createAccount
//       }`,
//     })
//     .catch(err => {
//       console.log(err.message)
//       console.log(err.name)
//       errorMesage(err.message)
//     });
// }

export async function handlePrizes(params) {
  const param = { ...params };
  for (const key in param) {
    if (param[key] === undefined) {
      delete param[key];
    } else if (key === 'amount') {
      param[key] -= 0;
    }
  }
  console.log(toGql(param));
  return client
    .mutate({
      fetchPolicy: 'no-cache',
      mutation: gql`mutation {
      handlePrizes(param: ${toGql(param)}) {
        id
        amount
        details {
          from
          to
          amount
          tokenType
          comment
        }
        type
        createAt
      }
    }`,
    })
    .catch(err => {
      errorMesage(err.message);
    });
}

export async function commonStatusEnum() {
  return client
    .query({
      fetchPolicy: 'network-only',
      query: gql`
        {
          commonStatusEnum {
            name
            value
          }
        }
      `,
    })
    .catch(err => {
      errorMesage(err.message);
    });
}

export async function sendCoinOverview() {
  return client
    .query({
      fetchPolicy: 'network-only',
      query: gql`
        {
          pending: queryPrizeList(filter: { status: 0 }) {
            pagination {
              total
            }
          }
          sending: queryPrizeList(filter: { status: 1 }) {
            pagination {
              total
            }
          }
          success: queryPrizeList(filter: { status: 2 }) {
            pagination {
              total
            }
          }
          failure: queryPrizeList(filter: { status: 3 }) {
            pagination {
              total
            }
          }
          total: queryPrizeList(filter: {}) {
            pagination {
              total
            }
          }
        }
      `,
    })
    .catch(err => {
      errorMesage(err.message);
    });
}

export async function queryBatchTrasactionTasks({ pageIndex, pageSize }) {
  console.log(pageIndex, pageSize);
  return client
    .query({
      fetchPolicy: 'network-only',
      query: gql`
        {
          queryBatchTrasactionTasks(pageSize: ${pageSize}, pageIndex: ${pageIndex}) {
            list {
              id
              amount
              type
              createAt
            }
            pagination {
              total
              current
              pageSize
              pageCount
            }
          }
        }
      `,
    })
    .catch(err => {
      errorMesage(err.message);
    });
}

export async function queryTxOperationRecords({ pageIndex, pageSize, taskID }) {
  console.log(pageIndex, pageSize, taskID);
  return client
    .query({
      fetchPolicy: 'network-only',
      query: gql`
        query {
          queryTxOperationRecords(pageIndex: ${pageIndex},pageSize: ${pageSize},taskID: "${taskID}") {
            pagination {
              total
              current
              pageSize
              pageCount
            }
            list {
              from
              to
              amount
              tokenType
              comment
            }
          }
        }
      `,
    })
    .catch(err => {
      errorMesage(err.message);
    });
}
