import moment from 'moment';
import QRCode from 'qrcode';
import {
  getAdminInfo,
  getTwoFactorAuthUrl,
  bindTwoFactorAuth,
  queryAllContract,
  deployCREContract,
  deployKycContract,
  deployAssetContract,
} from '../services/api';

export default {
  namespace: 'security',

  state: {
    bindMobile: false,
    bindTwoFactorAuth: false,
    getTwoFactorAuthUrl: null,
  },

  effects: {
    *getAdminInfo({ callback }, { call, put }) {
      const response = yield call(getAdminInfo);
      if (response) {
        callback(response.data.getAdminInfo);
        yield put({
          type: 'save',
          payload: {
            bindMobile: response.data.getAdminInfo.bindMobile,
            bindTwoFactorAuth: response.data.getAdminInfo.bindTwoFactorAuth,
          },
        });
      }
    },
    *getTwoFactorAuthUrl({ callback }, { call, put }) {
      const response = yield call(getTwoFactorAuthUrl);
      if (response) {
        const url = yield QRCode.toDataURL(response.data.getTwoFactorAuthUrl);
        console.log(callback);
        if (url) {
          yield put({
            type: 'save',
            payload: { getTwoFactorAuthUrl: url },
          });
        }
      }
    },
    *bindTwoFactorAuth({ params, callback }, { call }) {
      const response = yield call(bindTwoFactorAuth, params);
      callback(response);
    },
    *queryAllContract({ params }, { call, put }) {
      const response = yield call(queryAllContract, params);
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
  },

  reducers: {
    save(state, action) {
      return { ...state, ...action.payload };
    },
  },
};
