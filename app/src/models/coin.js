import moment from 'moment';
import {
  queryRule,
  removeRule,
  addRule,
  getAccountList,
  queryAllBalance,
  addWallet,
  createMultiAccount,
  queryTx,
  commonStatusEnum,
  sendCoinOverview,
  queryBatchTransactionTasks,
  handlePrizes,
  tokenTypeEnum,
  editTransaction,
} from '../services/api';

export default {
  namespace: 'coin',

  state: {
    data: {
      list: [],
      pagination: {},
    },
    statusEnum: [],
    tokenTypeEnum: [],
    sendCoinOverviewData: [],
    coinTotal: 0,
    queryBatchTransactionTasks: {
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
    *commonStatusEnum({ payload }, { call, put }) {
      const response = yield call(commonStatusEnum, payload);
      if (response) {
        yield put({
          type: 'save',
          statusEnum: response.data.statusEnum,
        });
      }
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
    *sendCoinOverview({ payload }, { call, put }) {
      const response = yield call(sendCoinOverview, payload);
      if (response) {
        const sendCoinOverviewData = [];
        let coinTotal;
        Object.keys(response.data).forEach(key => {
          if (key === 'total') {
            coinTotal = response.data[key].pagination.total;
          } else {
            sendCoinOverviewData.push({
              x: key,
              y: response.data[key].pagination.total,
            });
          }
        });
        yield put({
          type: 'save',
          sendCoinOverviewData,
          coinTotal,
        });
      }
    },
    *queryBatchTransactionTasks({ payload }, { call, put }) {
      const response = yield call(queryBatchTransactionTasks, payload);
      if (response) {
        yield put({
          type: 'save',
          queryBatchTransactionTasks: response.data.queryBatchTransactionTasks,
        });
      }
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
          filter: {},
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
    *queryTx(
      {
        params = {
          pageIndex: 0,
          pageSize: 10,
          filter: {},
        },
        callback,
      },
      { call, put }
    ) {
      const response = yield call(queryTx, params);
      const data = {};
      if (response) {
        data.list = response.data.queryTx.list.map((value, index) => {
          return {
            id: value.id,
            amount: value.amount,
            from: value.from,
            to: value.to,
            status: value.status,
            tokenType: value.tokenType,
            comment: value.comment,
            txid: value.txid,
            taskid: value.taskid,
            sendTime: value.sendTime === '' || moment(value.sendTime).format('YYYY-MM-DD HH:mm:ss'),
            confirmTime:
              value.confirmTime === '' || moment(value.confirmTime).format('YYYY-MM-DD HH:mm:ss'),
            errorMsg: value.errorMsg,
            executer: value.executer,
            creator: value.creator,
            key: index,
          };
        });
        data.pagination = response.data.queryTx.pagination;
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
        //   type: 'save',
        //   payload: response,
        // });
      }
      if (callback) callback();
    },
    *createMultiAccount({ params, callback }, { call }) {
      const response = yield call(createMultiAccount, params);
      if (response) {
        // yield put({
        //   type: 'save',
        //   payload: response,
        // });
      }
      if (callback) callback(response);
    },
    *handlePrizes({ params, callback }, { call }) {
      const response = yield call(handlePrizes, params);
      if (response) {
        // yield put({
        //   type: 'save',
        //   payload: response,
        // });
        if (callback) callback(response);
      }
    },
    *remove({ payload, callback }, { call, put }) {
      const response = yield call(removeRule, payload);
      yield put({
        type: 'save',
        payload: response,
      });
      if (callback) callback();
    },
    *editTransaction({ params, callback }, { call }) {
      const response = yield call(editTransaction, params);
      callback(response);
    },
  },

  reducers: {
    save(state, action) {
      return {
        ...state,
        data: { ...state.data, ...action.payload },
        statusEnum: action.statusEnum || state.statusEnum,
        tokenTypeEnum: action.tokenTypeEnum || state.tokenTypeEnum,
        sendCoinOverviewData: action.sendCoinOverviewData || state.sendCoinOverviewData,
        coinTotal: action.coinTotal || state.coinTotal,
        queryBatchTransactionTasks:
          action.queryBatchTransactionTasks || state.queryBatchTransactionTasks,
      };
    },
  },
};
