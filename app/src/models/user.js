import { changePwd, createAdmin, queryAdminList } from '../services/api';

export default {
  namespace: 'user',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *createAdmin({ params, callback }, { call }) {
      const response = yield call(createAdmin, params);
      if (response) {
        callback();
      }
    },
    *changePwd({ params, callback }, { call }) {
      const response = yield call(changePwd, params);
      if (response) {
        callback();
      }
    },
    *queryAdminList({ callback, params }, { call, put }) {
      const response = yield call(queryAdminList, params);
      console.log(response);
      const data = {};
      if (response) {
        data.list = response.data.queryAdminList.list.map((item, index) => {
          const newItem = { ...item };
          for (const key in newItem) {
            if (key === 'role') {
              newItem[key] = newItem[key] === 1 ? '超级管理员' : '普通管理员';
            }
          }
          return {
            ...newItem,
            key: index,
          };
        });
        data.pagination = response.data.queryAdminList.pagination;
      }
      if (callback) callback();
      console.log(data);
      yield put({
        type: 'save',
        payload: data,
      });
    },
  },

  reducers: {
    save(state, action) {
      return {
        data: { ...state.data, ...action.payload },
      };
    },
  },
};
