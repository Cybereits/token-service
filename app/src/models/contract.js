import moment from 'moment';
import {
  queryAllContract,
  addERC20ContractMeta,
  deployCREContract,
  deployKycContract,
  deployAssetContract,
  writeContractMethod,
} from '../services/api';

export default {
  namespace: 'contract',

  state: {
    data: {},
  },

  effects: {
    *addERC20ContractMeta({ params, callback }, { call }) {
      const response = yield call(addERC20ContractMeta, params);
      if (callback) callback(response);
    },
    *queryAllContract({ params }, { call, put }) {
      const response = yield call(queryAllContract, params);
      // console.log(response)
      const data = {};
      if (response) {
        data.list = response.data.queryAllContract.map((item, index) => {
          const newItem = { ...item };
          for (const key in newItem) {
            if (key === 'isERC20') {
              newItem[key] = newItem[key] === true ? '是' : '否';
            }
          }
          return {
            ...newItem,
            key: index,
            createAt: item.createAt === '' || moment(item.createAt).format('YYYY-MM-DD HH:mm:ss'),
          };
        });
        data.pagination = {
          total: data.list.length,
          current: 1,
          pageSize: data.list.length,
          pageCount: 1,
        };
        // console.log(data)
        yield put({
          type: 'save',
          payload: data,
        });
      }
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
    *writeContractMethod({ params, callback }, { call }) {
      const response = yield call(writeContractMethod, params);
      if (response) {
        if (callback) callback(response.data.writeContractMethod);
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
