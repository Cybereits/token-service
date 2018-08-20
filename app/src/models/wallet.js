import moment from 'moment';
import {
  queryRule,
  removeRule,
  addRule,
  getAccountList,
  queryAllBalance,
  addWallet,
  createMultiAccount,
  tokenTypeEnum,
  loadcsv,
} from '../services/api';

export default {
  namespace: 'wallet',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    tokenTypeEnum: [],
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
    *tokenTypeEnum({ payload }, { call, put }) {
      const response = yield call(tokenTypeEnum, payload);
      if (response) {
        yield put({
          type: 'save',
          tokenTypeEnum: response.data.tokenTypeEnum,
        });
      }
    },
    *queryAllBalance(
      {
        params = {
          pageIndex: 0,
          pageSize: 10,
          filter: {
            tokenType: 'eth',
          },
        },
        callback,
      },
      { call, put }
    ) {
      const response = yield call(queryAllBalance, params);
      const data = {};
      if (response) {
        data.list = response.data.queryAllBalance.list.map((item, index) => {
          return {
            ...item,
            key: index,
            createAt: item.createAt === '' || moment(item.createAt).format('YYYY-MM-DD HH:mm:ss'),
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
      if (callback) callback(response);
    },
    *loadcsv({ params, callback }, { call }) {
      const response = yield call(loadcsv, params);
      if (callback) callback(response);
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

        data: { ...state.data, ...action.payload },
        tokenTypeEnum: action.tokenTypeEnum || state.tokenTypeEnum,
      };
    },
  },
};
