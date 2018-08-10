import { queryNotices, queryServerStates } from '../services/api';

export default {
  namespace: 'global',

  state: {
    collapsed: true,
    notices: [],
    tokenBalanceOverviewList: [],
    currentBlockHeight: '',
    gasPrice: '',
  },

  effects: {
    *fetchNotices(_, { call, put }) {
      const data = yield call(queryNotices);
      yield put({
        type: 'saveNotices',
        payload: data,
      });
      yield put({
        type: 'user/changeNotifyCount',
        payload: data.length,
      });
    },
    *clearNotices({ payload }, { put, select }) {
      yield put({
        type: 'saveClearedNotices',
        payload,
      });
      const count = yield select(state => state.global.notices.length);
      yield put({
        type: 'user/changeNotifyCount',
        payload: count,
      });
    },
    *updateServerState(_, { call, put }) {
      const response = yield call(queryServerStates);
      if (response) {
        const { data: { queryServerStates: serverStates, tokenBalanceOverview } } = response;
        yield put({
          type: 'saveServerState',
          payload: serverStates,
        });
        yield put({
          type: 'saveTokenBalanceOverview',
          payload: tokenBalanceOverview,
        });
      }
    },
  },

  reducers: {
    changeLayoutCollapsed(state, { payload }) {
      return {
        ...state,
        collapsed: payload,
      };
    },
    saveNotices(state, { payload }) {
      return {
        ...state,
        notices: payload,
      };
    },
    saveClearedNotices(state, { payload }) {
      return {
        ...state,
        notices: state.notices.filter(item => item.type !== payload),
      };
    },
    saveServerState(state, { payload }) {
      return {
        ...state,
        currentBlockHeight: payload.currentBlockHeight,
        gasPrice: payload.gasPrice,
      };
    },
    saveTokenBalanceOverview(state, { payload }) {
      return {
        ...state,
        tokenBalanceOverviewList: payload,
      };
    },
  },

  subscriptions: {
    setup({ history }) {
      // Subscribe history(url) change, trigger `load` action if pathname is `/`
      return history.listen(({ pathname, search }) => {
        if (typeof window.ga !== 'undefined') {
          window.ga('send', 'pageview', pathname + search);
        }
      });
    },
  },
};
