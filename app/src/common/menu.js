import { isUrl } from '../utils/utils';

const menuData = [
  // {
  //   name: 'dashboard',
  //   icon: 'dashboard',
  //   path: 'dashboard',
  //   children: [
  //     {
  //       name: '钱包管理',
  //       path: 'analysis',
  //     },
  //     {
  //       name: '监控页',
  //       path: 'monitor',
  //     },
  //     {
  //       name: '工作台',
  //       path: 'workplace',
  //       // hideInBreadcrumb: true,
  //       // hideInMenu: true,
  //     },
  //   ],
  // },
  // {
  //   name: '表单页',
  //   icon: 'form',
  //   path: 'form',
  //   children: [
  //     {
  //       name: '基础表单',
  //       path: 'basic-form',
  //     },
  //     {
  //       name: '分步表单',
  //       path: 'step-form',
  //     },
  //     {
  //       name: '高级表单',
  //       authority: 'admin',
  //       path: 'advanced-form',
  //     },
  //   ],
  // },
  {
    name: '钱包管理',
    icon: 'wallet',
    path: 'wallet',
    children: [
      {
        name: '钱包列表',
        path: 'wallet-list',
      },
      // {
      //   name: '标准列表',
      //   path: 'basic-list',
      // },
      // {
      //   name: '卡片列表',
      //   path: 'card-list',
      // },
      // {
      //   name: '搜索列表',
      //   path: 'search',
      //   children: [
      //     {
      //       name: '搜索列表（文章）',
      //       path: 'articles',
      //     },
      //     {
      //       name: '搜索列表（项目）',
      //       path: 'projects',
      //     },
      //     {
      //       name: '搜索列表（应用）',
      //       path: 'applications',
      //     },
      //   ],
      // },
    ],
  },
  {
    name: '交易管理',
    icon: 'pay-circle-o',
    path: 'coin',
    children: [
      {
        name: '创建任务',
        path: 'coin-createTask',
      },
      {
        name: '代币归集',
        path: 'coin-gather',
      },
      {
        name: '交易列表',
        path: 'coin-send',
        authority: 'superAdmin',
      },
      {
        name: '任务列表',
        path: 'coin-overview',
      },
    ],
  },
  {
    name: '用户管理',
    icon: 'user',
    path: 'user',
    children: [
      {
        name: '创建用户',
        path: 'user-createUser',
        authority: 'superAdmin',
      },
      {
        name: '修改密码',
        path: 'user-changePwd',
      },
      {
        name: '用户列表',
        path: 'user-list',
      },
    ],
  },
  {
    name: '合约管理',
    icon: 'book',
    path: 'contract',
    children: [
      {
        name: '合约查询',
        path: 'contract-search',
      },
      {
        name: '创建合约',
        path: 'contract-create',
      },
      {
        name: '添加合约',
        path: 'contract-add',
      },
    ],
  },
  // {
  //   name: '详情页',
  //   icon: 'profile',
  //   path: 'profile',
  //   children: [
  //     {
  //       name: '基础详情页',
  //       path: 'basic',
  //     },
  //     {
  //       name: '高级详情页',
  //       path: 'advanced',
  //       authority: 'admin',
  //     },
  //   ],
  // },
  // {
  //   name: '结果页',
  //   icon: 'check-circle-o',
  //   path: 'result',
  //   children: [
  //     {
  //       name: '成功',
  //       path: 'success',
  //     },
  //     {
  //       name: '失败',
  //       path: 'fail',
  //     },
  //   ],
  // },
  // {
  //   name: '异常页',
  //   icon: 'warning',
  //   path: 'exception',
  //   children: [
  //     {
  //       name: '403',
  //       path: '403',
  //     },
  //     {
  //       name: '404',
  //       path: '404',
  //     },
  //     {
  //       name: '500',
  //       path: '500',
  //     },
  //     {
  //       name: '触发异常',
  //       path: 'trigger',
  //       hideInMenu: true,
  //     },
  //   ],
  // },
  // {
  //   name: '账户',
  //   icon: 'user',
  //   path: 'user',
  //   authority: 'guest',
  //   children: [
  //     {
  //       name: '登录',
  //       path: 'login',
  //     },
  //   ],
  // },
];

function formatter(data, parentPath = '/', parentAuthority) {
  return data.map(item => {
    let { path } = item;
    if (!isUrl(path)) {
      path = parentPath + item.path;
    }
    const result = {
      ...item,
      path,
      authority: item.authority || parentAuthority,
    };
    if (item.children) {
      result.children = formatter(item.children, `${parentPath}${item.path}/`, item.authority);
    }
    return result;
  });
}

export const getMenuData = () => formatter(menuData);
