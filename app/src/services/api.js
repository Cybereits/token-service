import { stringify } from 'qs';
import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';
import { errorMesage } from '../utils/networkErrorMsg';
import request from '../utils/request';
import { toGql } from '../utils/utils';
import config from '../../config/env.json';

const { host, port, baseUrl } = config;
console.log(`${host}${port ? `:${port}` : ''}${baseUrl}`);
const client = new ApolloClient({
  uri: `${host}${port ? `:${port}` : ''}${baseUrl}`,
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

export async function accountLogin({ userName, password }) {
  return client
    .query({
      fetchPolicy: 'network-only',
      query: gql`
        {
          adminLogin(username: "${userName}", password: "${password}") {
            username
            message
            role
          }
        }
      `,
    })
    .catch(err => {
      console.log(err.message);
      errorMesage(err.message);
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
  console.log(newFilter);
  return client
    .query({
      fetchPolicy: 'network-only',
      query: gql`
        {
          queryAllBalance(pageIndex: ${pageIndex}, pageSize: ${pageSize}, filter: ${toGql(
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

export async function sendTransactionfFromIds(params) {
  console.log(params);
  return client
    .mutate({
      fetchPolicy: 'no-cache',
      mutation: gql`
        mutation {
          sendTransaction(ids: ${JSON.stringify(params)})
        }
      `,
    })
    .catch(err => {
      errorMesage(err.message);
    });
}

export async function createBatchTransactions({ transactions, comment, tokenType, outAccount }) {
  console.log(transactions, comment, tokenType, outAccount, toGql(tokenType));
  return client
    .mutate({
      fetchPolicy: 'no-cache',
      mutation: gql`
        mutation {
          createBatchTransactions(transactions: "${transactions}", comment: "${comment}", tokenType: ${toGql(
        tokenType
      )}, outAccount: "${outAccount}") {
            id,
            amount,
            comment,
            createAt
          }
        }
      `,
    })
    .catch(err => {
      errorMesage(err.message);
    });
}

export async function sendTransactionfFromTaskid(params) {
  console.log(params);
  return client
    .mutate({
      fetchPolicy: 'no-cache',
      mutation: gql`
        mutation {
          sendTransaction(taskid: "${params}")
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

export async function queryTx({ pageIndex, pageSize, filter }) {
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
          queryTx(pageIndex: ${pageIndex},pageSize: ${pageSize}, filter: ${toGql(newFilter)}) {
            pagination {
              total
              current
              pageSize
              pageCount
            }
            list {
              id,
              amount,
              from,
              to,
              status,
              tokenType,
              comment,
              txid,
              taskid,
              sendTime,
              confirmTime
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
          pending: queryTx(filter: { status: 0 }) {
            pagination {
              total
            }
          }
          sending: queryTx(filter: { status: 1 }) {
            pagination {
              total
            }
          }
          success: queryTx(filter: { status: 2 }) {
            pagination {
              total
            }
          }
          failure: queryTx(filter: { status: -1 }) {
            pagination {
              total
            }
          }
          total: queryTx(filter: {}) {
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
            pagination {
              total,
              current,
              pageSize,
              pageCount
            }
            list {
              id,
              amount,
              comment,
              createAt
            }
          }
        }
      `,
    })
    .catch(err => {
      errorMesage(err.message);
    });
}

export async function queryTxRecordsViaTaskId({ pageIndex, pageSize, taskID }) {
  console.log(pageIndex, pageSize, taskID);
  return client
    .query({
      fetchPolicy: 'network-only',
      query: gql`
        query {
          queryTxRecordsViaTaskId(pageIndex: ${pageIndex},pageSize: ${pageSize},taskID: "${taskID}") {
            list {
              id,
              amount,
              from,
              to,
              status,
              tokenType,
              comment,
              txid,
              taskid,
              sendTime,
              confirmTime,
            },
            pagination{
              total,
              current,
              pageSize,
              pageCount,
            }
          }
        }
      `,
    })
    .catch(err => {
      errorMesage(err.message);
    });
}
