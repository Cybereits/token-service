import { stringify } from 'qs';
import ApolloClient from 'apollo-boost';
import { message } from 'antd';
import gql from 'graphql-tag';
import { setAuthority } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';
// import { errorMesage } from '../utils/networkErrorMsg';
import request from '../utils/request';
import { toGql } from '../utils/utils';
import config from '../../config/env.json';

const { host, port, baseUrl } = config;
console.log(`${host}${port ? `:${port}` : ''}${baseUrl}`);

const client = new ApolloClient({
  request: async operation => {
    operation.setContext({
      fetchOptions: {
        credentials: 'include',
      },
    });
  },
  uri: `${host}${port ? `:${port}` : ''}${baseUrl}`,
  onError: ({ graphQLErrors }) => {
    console.log('graphQLErrors', graphQLErrors);
    if (graphQLErrors && graphQLErrors.length > 0 && graphQLErrors[0].message !== 'Not logged in') {
      message.error(graphQLErrors[0].message);
      if (graphQLErrors[0].message === 'Unauthorized!') {
        const currentAuthority = '';
        setAuthority(currentAuthority);
        reloadAuthorized();
        window.location.href = `${window.location.origin}/#/entry/login`;
      }
    }
  },
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
            role
          }
        }
      `,
    })
    .catch(err => {
      console.log(err.message.replace(/GraphQL error: (\w+)/gi, '$1'));
    });
}

export async function accountLogout() {
  return client
    .query({
      fetchPolicy: 'network-only',
      query: gql`
        {
          adminLogout {
            result
          }
        }
      `,
    })
    .catch(err => {
      console.log(err.message.replace(/GraphQL error: (\w+)/gi, '$1'));
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
  const newFilter = { ...filter };
  // console.log(newFilter)
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
              address
              eth
              token
            }
          }
        }
      `,
    })
    .catch(err => {
      console.log(err);
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
      console.log(err);
    });
}

export async function createAdmin({ username, password, validPassword }) {
  return client
    .mutate({
      fetchPolicy: 'no-cache',
      mutation: gql`
        mutation {
          createAdmin(username: "${username}", password: "${password}", validPassword: "${validPassword}"){
            username
            role
          }
        }
      `,
    })
    .catch(err => {
      console.log(err);
    });
}

export async function sendTransactionfFromIds(params) {
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
      console.log(err);
    });
}

export async function createBatchTransactions({ transactions, comment, tokenType, outAccount }) {
  return client
    .mutate({
      fetchPolicy: 'no-cache',
      mutation: gql`
        mutation {
          createBatchTransactions(transactions: "${transactions}", comment: "${comment}", tokenType: ${toGql(
        tokenType
      )}, outAccount: "${outAccount}") {
            id,
            count,
            comment,
            createAt
          }
        }
      `,
    })
    .catch(err => {
      console.log(err);
    });
}

export async function sendTransactionfFromTaskid(params) {
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
      console.log(err);
    });
}

export async function createMultiAccount(parmas) {
  return client
    .mutate({
      fetchPolicy: 'no-cache',
      mutation: gql`mutation {
      createMultiAccount(amount: ${parmas.walletAmount})
    }`,
    })
    .catch(err => {
      console.log(err);
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
      console.log(err);
    });
}

export async function handlePrizes(params) {
  const param = { ...params };
  for (const key in param) {
    if (param[key] === undefined) {
      delete param[key];
    } else if (key === 'amount') {
      param[key] -= 0;
    }
  }
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
      console.log(err);
    });
}

export async function commonStatusEnum() {
  return client
    .query({
      fetchPolicy: 'network-only',
      query: gql`
        {
          statusEnum {
            name
            value
          }
        }
      `,
    })
    .catch(err => {
      console.log(err);
    });
}

export async function tokenTypeEnum() {
  return client
    .query({
      fetchPolicy: 'network-only',
      query: gql`
        {
          tokenTypeEnum {
            name
            value
          }
        }
      `,
    })
    .catch(err => {
      console.log(err);
    });
}

export async function sendCoinOverview() {
  return client
    .query({
      fetchPolicy: 'network-only',
      query: gql`
        {
          pending: queryTx(filter: { status: "0" }) {
            pagination {
              total
            }
          }
          sending: queryTx(filter: { status: "1" }) {
            pagination {
              total
            }
          }
          success: queryTx(filter: { status: "2" }) {
            pagination {
              total
            }
          }
          failure: queryTx(filter: { status: "-1" }) {
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
      console.log(err);
    });
}

export async function queryBatchTrasactionTasks({ pageIndex, pageSize }) {
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
              count,
              comment,
              createAt
            }
          }
        }
      `,
    })
    .catch(err => {
      console.log(err);
    });
}

export async function queryTxRecordsViaTaskId({ pageIndex, pageSize, taskID }) {
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
      console.log(err);
    });
}

export async function changePwd(params) {
  console.log(params)
  return client
    .mutate({
      // fetchPolicy: 'no-cache',
      mutation: gql`mutation {
        changePwd(originPassword:"${params.originPassword}",newPassword:"${params.newPassword}",validPassword:"${params.validPassword}") {
          username,
          role,
        }
    }`,
    })
    .catch(err => {
      console.log(err);
    });
}