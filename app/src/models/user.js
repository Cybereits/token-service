import { changePwd } from '../services/api';

export default {
  namespace: 'user',

  state: {
    changePwd: {},
  },

  effects: {
    *changePwd({ params, callback }, { call }) {
      const response = yield call(changePwd, params);
      if (response) {
        console.log('debug');
        callback();
      }
    },

    // *fetch(_, { call, put }) {
    //   const response = yield call(queryUsers);
    //   yield put({
    //     type: 'save',
    //     payload: response,
    //   });
    // },
    // *fetchCurrent(_, { call, put }) {
    //   const response = yield call(queryCurrent);
    //   yield put({
    //     type: 'saveCurrentUser',
    //     payload: response,
    //   });
    // },
  },

  reducers: {
    save(state, action) {
      console.log(action, state);
      return {
        ...state,
        ...action.payload,
      };
    },
    saveCurrentUser(state, action) {
      return {
        ...state,
        currentUser: action.payload,
      };
    },
    changeNotifyCount(state, action) {
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          notifyCount: action.payload,
        },
      };
    },
  },
};
