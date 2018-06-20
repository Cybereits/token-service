import { deployCREContract, deployKycContract, deployAssetContract } from '../services/api';

export default {
  namespace: 'contract',

  state: {},

  effects: {
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
        ...state,
        data: { ...state.data, ...action.payload },
        statusEnum: action.statusEnum || state.statusEnum,
        tokenTypeEnum: action.tokenTypeEnum || state.tokenTypeEnum,
        sendCoinOverviewData: action.sendCoinOverviewData || state.sendCoinOverviewData,
        coinTotal: action.coinTotal || state.coinTotal,
        queryBatchTrasactionTasks:
          action.queryBatchTrasactionTasks || state.queryBatchTrasactionTasks,
      };
    },
  },
};
