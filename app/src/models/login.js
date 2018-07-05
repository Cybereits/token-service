import { routerRedux } from 'dva/router';
import { accountLogin, accountLogout, resetPwd } from '../services/api';
import { setAuthority } from '../utils/authority';
import { reloadAuthorized } from '../utils/Authorized';

export default {
  namespace: 'login',

  state: {
    status: undefined,
  },

  effects: {
    *login({ payload }, { call, put }) {
      const response = yield call(accountLogin, payload);
      if (response) {
        yield put({
          type: 'changeLoginStatus',
          payload: response.data.adminLogin,
        });
        reloadAuthorized();
        yield put(routerRedux.push('/'));
      }
    },
    *logout(_, { put, call, select }) {
      const response = yield call(accountLogout);
      if (response) {
        try {
          // get location pathname
          const urlParams = new URL(window.location.href);
          const pathname = yield select(state => state.routing.location.pathname);
          console.log(urlParams, pathname);
          // add the parameters in the url
          // urlParams.searchParams.set('redirect', pathname);
          // window.history.replaceState(null, 'login', urlParams.href);
        } finally {
          yield put({
            type: 'changeLoginStatus',
            payload: {
              status: false,
            },
          });
          const currentAuthority = '';
          setAuthority(currentAuthority);
          reloadAuthorized();
          yield put(routerRedux.push('/entry/login'));
        }
      }
    },
    *resetPwd({ callback, params }, { call }) {
      const response = yield call(resetPwd, params);
      if (response) {
        callback();
      }
    },
  },

  reducers: {
    changeLoginStatus(state, { payload }) {
      let currentAuthority;
      if (payload.role === 1) {
        currentAuthority = 'superAdmin';
        setAuthority(currentAuthority);
      } else if (payload.role === 2) {
        currentAuthority = 'admin';
        setAuthority(currentAuthority);
      }
      return {
        ...state,
        status: payload.status,
        type: payload.type,
      };
    },
  },
};
