import {
  queryBatchTrasactionTasks,
  queryTxRecordsViaTaskId,
  sendTransactionfFromIds,
  sendTransactionfFromTaskid,
  createBatchTransactions,
  tokenTypeEnum,
} from '../services/api';

export default {
  namespace: 'coinTask',

  state: {
    tokenTypeEnum: [],
    queryBatchTrasactionTasks: {
      list: [],
      pagination: {},
    },
    queryTxOperationRecords: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *tokenTypeEnum({ payload }, { call, put }) {
      const response = yield call(tokenTypeEnum, payload);
      if (response) {
        yield put({
          type: 'getTaskData',
          tokenTypeEnum: response.data.tokenTypeEnum,
        });
      }
    },
    *createBatchTransactions({ params, callback }, { call }) {
      const response = yield call(createBatchTransactions, params);
      if (response) {
        callback();
      }
      // if (response) {
      //   yield put({
      //     type: 'getTaskData',
      //     queryBatchTrasactionTasks: response.data.queryBatchTrasactionTasks,
      //   });
      // }
    },
    *sendTransactionfFromTaskid({ params, callback }, { call }) {
      const response = yield call(sendTransactionfFromTaskid, params);
      if (response) {
        callback();
      }
      // if (response) {
      //   yield put({
      //     type: 'getTaskData',
      //     queryBatchTrasactionTasks: response.data.queryBatchTrasactionTasks,
      //   });
      // }
    },
    *sendTransactionfFromIds({ params, callback }, { call }) {
      const response = yield call(sendTransactionfFromIds, params);
      if (response) {
        callback();
      }
      // if (response) {
      //   yield put({
      //     type: 'getTaskData',
      //     queryBatchTrasactionTasks: response.data.queryBatchTrasactionTasks,
      //   });
      // }
    },
    *queryBatchTrasactionTasks(
      {
        params = {
          pageIndex: 1,
          pageSize: 10,
        },
      },
      { call, put }
    ) {
      const response = yield call(queryBatchTrasactionTasks, params);
      if (response) {
        yield put({
          type: 'getTaskData',
          queryBatchTrasactionTasks: response.data.queryBatchTrasactionTasks,
        });
      }
    },
    *queryTxOperationRecords(
      {
        params = {
          pageIndex: 1,
          pageSize: 10,
        },
      },
      { call, put }
    ) {
      const response = yield call(queryTxRecordsViaTaskId, params);
      if (response) {
        yield put({
          type: 'getTaskData',
          queryTxOperationRecords: response.data.queryTxRecordsViaTaskId,
        });
      }
    },
  },

  reducers: {
    getTaskData(state, action) {
      return {
        ...state,
        tokenTypeEnum: action.tokenTypeEnum || state.tokenTypeEnum,
        queryBatchTrasactionTasks:
          action.queryBatchTrasactionTasks || state.queryBatchTrasactionTasks,
        queryTxOperationRecords: action.queryTxOperationRecords || state.queryTxOperationRecords,
      };
    },
  },
};
