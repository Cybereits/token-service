import moment from 'moment';
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
        const newQueryBatchTrasactionTasks = {};
        newQueryBatchTrasactionTasks.list = response.data.queryBatchTrasactionTasks.list.map(
          (item, index) => {
            return {
              ...item,
              createAt: item.createAt === '' || moment(item.createAt).format('YYYY-MM-DD hh:mm:ss'),
              key: index,
            };
          }
        );
        newQueryBatchTrasactionTasks.pagination =
          response.data.queryBatchTrasactionTasks.pagination;
        yield put({
          type: 'getTaskData',
          queryBatchTrasactionTasks: newQueryBatchTrasactionTasks,
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
        const newQueryTxRecordsViaTaskId = {};
        newQueryTxRecordsViaTaskId.list = response.data.queryTxRecordsViaTaskId.list.map(
          (item, index) => {
            return {
              ...item,
              confirmTime:
                item.confirmTime === '' || moment(item.confirmTime).format('YYYY-MM-DD hh:mm:ss'),
              sendTime: item.sendTime === '' || moment(item.sendTime).format('YYYY-MM-DD hh:mm:ss'),
              key: index,
            };
          }
        );
        newQueryTxRecordsViaTaskId.pagination = response.data.queryTxRecordsViaTaskId.pagination;
        yield put({
          type: 'getTaskData',
          queryTxOperationRecords: newQueryTxRecordsViaTaskId,
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
