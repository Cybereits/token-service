import { changePwd, createAdmin } from '../services/api';

export default {
  namespace: 'user',

  state: {},

  effects: {
    *createAdmin({ params, callback }, { call }) {
      const response = yield call(createAdmin, params);
      if (response) {
        callback();
      }
    },
    *changePwd({ params, callback }, { call }) {
      const response = yield call(changePwd, params);
      if (response) {
        callback();
      }
    },
  },

  reducers: {
    // save(state, action) {
    //   return {
    //     ...state,
    //     list: action.payload,
    //   };
    // },
    // saveCurrentUser(state, action) {
    //   return {
    //     ...state,
    //     currentUser: action.payload,
    //   };
    // },
    // changeNotifyCount(state, action) {
    //   return {
    //     ...state,
    //     currentUser: {
    //       ...state.currentUser,
    //       notifyCount: action.payload,
    //     },
    //   };
    // },
  },
};
