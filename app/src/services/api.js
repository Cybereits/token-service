import { stringify } from 'qs';
import ApolloClient from 'apollo-boost';
import gql from 'graphql-tag';
import request from '../utils/request';

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

export async function queryAllBalance() {
  return client
    .query({
      query: gql`
        {
          queryAllBalance {
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
      console.log(err);
    });
}
