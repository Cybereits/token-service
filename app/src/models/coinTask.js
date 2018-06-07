import {
  queryBatchTrasactionTasks,
  queryTxRecordsViaTaskId,
  sendTransactionfFromIds,
  sendTransactionfFromTaskid,
  createBatchTransactions,
} from '../services/api';

export default {
  namespace: 'coinTask',

  state: {
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
    *createBatchTransactions({ params, callback }, { call }) {
      console.log(params);
      const response = yield call(createBatchTransactions, params);
      callback();
      console.log(response.data.createBatchTransactions);
      // if (response) {
      //   yield put({
      //     type: 'getTaskData',
      //     queryBatchTrasactionTasks: response.data.queryBatchTrasactionTasks,
      //   });
      // }
    },
    *sendTransactionfFromTaskid({ params, callback }, { call }) {
      console.log(params);
      const response = yield call(sendTransactionfFromTaskid, params);
      callback();
      console.log(response.data.sendTransaction);
      // if (response) {
      //   yield put({
      //     type: 'getTaskData',
      //     queryBatchTrasactionTasks: response.data.queryBatchTrasactionTasks,
      //   });
      // }
    },
    *sendTransactionfFromIds({ params, callback }, { call }) {
      console.log(params);
      const response = yield call(sendTransactionfFromIds, params);
      callback();
      console.log(response.data.sendTransaction);
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
      console.log(response.data.queryBatchTrasactionTasks);
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
      console.log(params);
      const response = yield call(queryTxRecordsViaTaskId, params);
      console.log(response.data.queryTxRecordsViaTaskId);
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
      console.log(state);
      console.log(action);
      return {
        ...state,
        queryBatchTrasactionTasks:
          action.queryBatchTrasactionTasks || state.queryBatchTrasactionTasks,
        queryTxOperationRecords: action.queryTxOperationRecords || state.queryTxOperationRecords,
      };
    },
  },
};
