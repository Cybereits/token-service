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

// const loginClient = new ApolloClient({
//   request: async operation => {
//     operation.setContext({
//       fetchOptions: {
//         credentials: 'include',
//       },
//     });
//   },
//   uri: `${host}${port ? `:${port}` : ''}${publicUrl}`,
//   onError: ({ graphQLErrors }) => {
//     console.log('graphQLErrors', graphQLErrors);
//     if (graphQLErrors && graphQLErrors.length > 0 && graphQLErrors[0].message !== 'Not logged in') {
//       message.error(graphQLErrors[0].message);
//       if (graphQLErrors[0].message === 'Unauthorized!') {
//         const currentAuthority = '';
//         setAuthority(currentAuthority);
//         reloadAuthorized();
//         window.location.href = `${window.location.origin}/#/entry/login`;
//       }
//     }
//   },
// });


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

export async function accountLogin({ userName, password, token }) {
  console.log(token)
  return client
    .query({
      fetchPolicy: 'network-only',
      query: gql`
        {
          adminLogin(username: "${userName}", password: "${password}", token: "${token}") {
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
          adminLogout
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
              createAt
              comment
            }
          }
        }
      `,
    })
    .catch(err => {
      console.log(err);
    });
}

export async function addWallet(params) {
  return client
    .mutate({
      fetchPolicy: 'no-cache',
      mutation: gql`
        mutation {
          createAccount(comment: "${params.comment}", password: "${params.password}")
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
          createBatchTransactions(transactions: "${transactions}", comment: "${comment}", tokenType: "${toGql(
          tokenType
        )}", outAccount: "${outAccount}") {
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

export async function createMultiAccount(params) {
  console.log('debug', params)
  return client
    .mutate({
      fetchPolicy: 'no-cache',
      mutation: gql`mutation {
      createMultiAccount(count: ${params.walletAmount}, comment: "${params.comment}", password: "${params.password}")
    }`,
    })
    .catch(err => {
      console.log(err);
    });
}

export async function writeContractMethod({caller, contractName, methodName, paramArrInJson}) {
  console.log(caller, contractName, methodName, paramArrInJson)
  return client
    .mutate({
      fetchPolicy: 'no-cache',
      mutation: gql`mutation {
        writeContractMethod(caller: "${caller}", contractName: "${contractName}", methodName: "${methodName}", paramArrInJson: "${encodeURIComponent(paramArrInJson)}")
    }`,
    })
    .catch(err => {
      console.log(err);
    });
}

export async function resetPwd({username, newPassword, validPassword, token}) {
  return client
    .mutate({
      fetchPolicy: 'no-cache',
      mutation: gql`mutation {
        resetPwd(username: "${username}", newPassword: "${newPassword}", validPassword: "${validPassword}", token: "${token}")
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
              confirmTime,
              creator,
              executer,
              errorMsg,
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

export async function queryBatchTransactionTasks({ pageIndex, pageSize }) {
  return client
    .query({
      fetchPolicy: 'network-only',
      query: gql`
        {
          queryBatchTransactionTasks(pageSize: ${pageSize}, pageIndex: ${pageIndex}) {
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
              executer,
              creator,
              errorMsg,
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

export async function editTransaction(params) {
  console.log(params)
  return client
    .mutate({
      // fetchPolicy: 'no-cache',
      mutation: gql`mutation {
        editTransaction(id:"${params.id}",outAccount:"${params.from}",to:"${params.to}", amount:${params.amount}) {
          id,
        }
    }`,
    })
    .catch(err => {
      console.log(err);
    });
}

export async function deployCREContract(params) {
  console.log(params.lockAddresses)
  const newParams = { ...params };
  for (const key in newParams) {
    if (newParams[key] === undefined) {
      newParams[key] = ''
    }
  }
  return client
    .mutate({
      // fetchPolicy: 'no-cache',
      mutation: gql`mutation {
        deployCREContract(deployer: "${newParams.address}", contractArgs: {
          tokenSupply: ${newParams.tokenSupply},
          contractDecimals: ${newParams.contractDecimals},
          lockPercent: ${newParams.lockPercent},
          lockAddresses: ${JSON.stringify(newParams.lockAddresses)}
        })
    }`,
    })
    .catch(err => {
      console.log(err);
    });
}
export async function queryAllContract(params={}) {
  return client
    .query({
      fetchPolicy: 'network-only',
      query: gql`
        query {
          queryAllContract(filter: ${toGql(params)}) {
            name,
            symbol,
            decimal,
            codes,
            abis,
            owner,
            address,
            args,
            isERC20,
            createAt,
          }
        }
      `,
    })
    .catch(err => {
      console.log(err);
    });
}
// export async function deployKycContract(params) {
//   console.log(params)
//   const newParams = { ...params };
//   for (const key in newParams) {
//     if (newParams[key] === undefined) {
//       newParams[key] = ''
//     }
//   }
//   return client
//     .mutate({
//       // fetchPolicy: 'no-cache',
//       mutation: gql`mutation {
//         deployKycContract(deployer: "${newParams.address}", contractArgs: {
//           tokenSupply: ${newParams.tokenSupply},
//           tokenSymbol: "${newParams.tokenSymbol}",
//           contractName: "${newParams.contractName}",
//           contractDecimals: ${newParams.contractDecimals}
//         })
//     }`,
//     })
//     .catch(err => {
//       console.log(err);
//     });
// }
export async function deployKycContract(params) {
  console.log(params)
  const newParams = { ...params };
  for (const key in newParams) {
    if (newParams[key] === undefined) {
      newParams[key] = ''
    }
  }
  return client
    .mutate({
      // fetchPolicy: 'no-cache',
      mutation: gql`mutation {
        deployKycContract(deployer: "${newParams.address}", contractName: "${newParams.contractName}")
    }`,
    })
    .catch(err => {
      console.log(err);
    });
}
export async function deployAssetContract(params) {
  console.log(params)
  const newParams = { ...params };
  for (const key in newParams) {
    if (newParams[key] === undefined) {
      newParams[key] = ''
    }
  }
  return client
    .mutate({
      // fetchPolicy: 'no-cache',
      mutation: gql`mutation {
        deployAssetContract(deployer: "${newParams.address}", contractArgs: {
          tokenSupply: ${newParams.tokenSupply},
          tokenSymbol: "${newParams.tokenSymbol}",
          contractName: "${newParams.contractName}",
          contractDecimals: ${newParams.contractDecimals}
        }, kycAddress: "${newParams.kycAddress}")
    }`,
    })
    .catch(err => {
      console.log(err);
    });
}


export async function addERC20ContractMeta(params) {
  console.log(params)
  return client
    .mutate({
      // fetchPolicy: 'no-cache',
      mutation: gql`mutation {
        addERC20ContractMeta(name: "${params.name}", symbol: "${params.symbol}", decimal: ${params.decimal},codes: "${params.codes}",abis: "${params.abis}",address: "${params.address}")
    }`,
    })
    .catch(err => {
      console.log(err);
    });
}

export async function bindTwoFactorAuth(params) {
  console.log(params)
  return client
    .mutate({
      // fetchPolicy: 'no-cache',
      mutation: gql`mutation {
        bindTwoFactorAuth(token: "${params.token}")
    }`,
    })
    .catch(err => {
      console.log(err);
    });
}

export async function queryAdminList(params={pageIndex:0,pageSize:10}) {
console.log(params)
  return client
  .query({
    // fetchPolicy: 'network-only',
    query: gql`
      query {
        queryAdminList(pageIndex:${params.pageIndex},pageSize:${params.pageSize}) {
          list {
            username,
            role,
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

export async function getAdminInfo() {
  return client
    .query({
      fetchPolicy: 'network-only',
      query: gql`
        {
          getAdminInfo {
            username
            role
            bindTwoFactorAuth
            bindMobile
          }
        }
      `,
    })
    .catch(err => {
      console.log(err.message.replace(/GraphQL error: (\w+)/gi, '$1'));
    });
}

export async function getTwoFactorAuthUrl() {
  return client
    .query({
      fetchPolicy: 'network-only',
      query: gql`
        {
          getTwoFactorAuthUrl
        }
      `,
    })
    .catch(err => {
      console.log(err.message.replace(/GraphQL error: (\w+)/gi, '$1'));
    });
}
