import { queryBatchTrasactionTasks, queryTxOperationRecords } from '../services/api';

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
      const response = yield call(queryTxOperationRecords, params);
      console.log(response.data.queryTxOperationRecords);
      if (response) {
        yield put({
          type: 'getTaskData',
          queryTxOperationRecords: response.data.queryTxOperationRecords,
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
