import {
  queryRule,
  removeRule,
  addRule,
  getAccountList,
  queryAllBalance,
  addWallet,
  createMultiAccount,
} from '../services/api';

export default {
  namespace: 'wallet',

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
    *queryAllBalance(
      {
        params = {
          pageIndex: 0,
          pageSize: 10,
          filter: {
            orderBy: 'Enum(eth)',
          },
        },
        callback,
      },
      { call, put }
    ) {
      const response = yield call(queryAllBalance, params);
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
        yield put({
          type: 'save',
          payload: data,
        });
      }
      if (callback) callback();
    },
    *add({ payload, callback }, { call, put }) {
      const response = yield call(addRule, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *addWallet({ params, callback }, { call }) {
      const response = yield call(addWallet, params);
      if (response) {
        // yield put({
        //   type: 'addWallet',
        //   payload: response,
        // });
      }
      if (callback) callback();
    },
    *createMultiAccount({ params, callback }, { call, put }) {
      const response = yield call(createMultiAccount, params);
      if (response) {
        yield put({
          type: 'save',
          payload: response,
        });
      }
      if (callback) callback(response);
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
