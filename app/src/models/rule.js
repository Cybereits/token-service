import { queryRule, removeRule, addRule, getAccountList, queryAllBalance } from '../services/api';

export default {
  namespace: 'rule',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *fetch({ payload }, { call, put }) {
      const response = yield call(queryRule, payload);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *getAccountList({ payload }, { call, put }) {
      const response = yield call(getAccountList, payload);
      const data = {};
      if (response) {
        data.list = response.data.getAccountList.map((value, index) => {
          return { key: index, address: value };
        });
      }
      yield put({
        type: 'save',
        payload: data,
      });
    },
    *queryAllBalance({ payload }, { call, put }) {
      const response = yield call(queryAllBalance, payload);
      const data = {};
      if (response) {
        data.list = response.data.queryAllBalance.list.map((value, index) => {
          return {
            ethAddress: value.ethAddress,
            ethAmount: value.balances[0].value,
            creAmount: value.balances[1].value,
            key: index,
          };
        });
        data.pagination = response.data.queryAllBalance.pagination;
      }
      yield put({
        type: 'save',
        payload: data,
      });
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addRule, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(removeRule, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: action.payload,
      };
    },
  },
};
