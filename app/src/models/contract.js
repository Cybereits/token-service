import {
  queryAllContract,
  addERC20ContractMeta,
  deployCREContract,
  deployKycContract,
  deployAssetContract,
} from '../services/api';

export default {
  namespace: 'contract',

  state: {
    data: {
      list: [],
      pagination: {},
    },
  },

  effects: {
    *addERC20ContractMeta({ params, callback }, { call }) {
      console.log(params);
      const response = yield call(addERC20ContractMeta, params);
      if (callback) callback(response);
    },
    *queryAllContract({ params }, { call, put }) {
      const response = yield call(queryAllContract, params);
      yield put({
        type: 'save',
        payload: response,
      });
    },
    *deployCREContract({ params, callback }, { call }) {
      const response = yield call(deployCREContract, params);
      if (response) {
        if (callback) callback();
      }
    },
    *deployKycContract({ params, callback }, { call }) {
      const response = yield call(deployKycContract, params);
      if (response) {
        if (callback) callback();
      }
    },
    *deployAssetContract({ params, callback }, { call }) {
      const response = yield call(deployAssetContract, params);
      if (response) {
        if (callback) callback();
      }
    },
  },

  reducers: {
    save(state, action) {
      return {
        data: { ...state.data, ...action.payload },
      };
    },
  },
};
