import React, { PureComponent } from 'react';
import { connect } from 'dva';
// import ApolloClient from 'apollo-boost';
// import gql from 'graphql-tag';
import { routerRedux } from 'dva/router';
// import moment from 'moment';
import {
  // Row,
  // Col,
  Card,
  // Form,
  // Input,
  // Select,
  Icon,
  Button,
  Dropdown,
  Menu,
  // InputNumber,
  // DatePicker,
  Modal,
  message,
  // Badge,
  // Divider,
} from 'antd';
import StandardTable from 'components/StandardTable';
// import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './CoinSend.less';
// import { getQueryVariable } from '../../utils/utils';
const { confirm } = Modal;
@connect(({ coinTask, loading }) => ({
  coinTask,
  loading: loading.models.coinTask,
}))
export default class CoinTaskDetail extends PureComponent {
  state = {
    selectedRows: [],
  };

  componentDidMount() {
    this.handleSearch(0, 10);
    // const { dispatch } = this.props;
    // dispatch({
    //   type: 'coin/commonStatusEnum',
    // });
  }

  handleSearch = (pageIndex, pageSize) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'coinTask/queryTxOperationRecords',
      params: {
        pageIndex,
        pageSize,
        taskID: this.props.match.params.taskid,
      },
    });
  };

  handleStandardTableChange = pagination => {
    this.handleSearch(pagination.current - 1, pagination.pageSize);
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleMenuClick = e => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;
    const newthis = this;

    if (!selectedRows) return;

    switch (e.key) {
      case 'sendCoin':
        /*eslint-disable*/
        confirm({
          okText: '确认',
          cancelText: '取消',
          title: (
            <p>
              确定要发送<span style={{ color: 'red' }}> {selectedRows.length} </span>比转账吗？
            </p>
          ),
          onOk() {
            return new Promise(resolve => {
              dispatch({
                type: 'coinTask/sendTransactionfFromIds',
                params: selectedRows.map(row => row.id),
                callback: () => {
                  resolve();
                  message.success('发送成功！');
                  newthis.setState({
                    selectedRows: [],
                  });
                  newthis.handleSearch(0, 10);
                },
              });
            });
          },
          onCancel() {
            console.log('Cancel');
          },
        });
        break;
      default:
        break;
    }
  };

  render() {
    const { coinTask: { queryTxOperationRecords }, loading } = this.props;
    const { selectedRows } = this.state;
    const columns = [
      {
        title: '入账地址',
        dataIndex: 'to',
        fixed: 'left',
      },
      {
        title: 'id',
        dataIndex: 'id',
      },
      {
        title: '代币数量',
        dataIndex: 'amount',
      },
      {
        title: '出账地址',
        dataIndex: 'from',
      },
      {
        title: '状态',
        dataIndex: 'status',
      },
      {
        title: '代币类型',
        dataIndex: 'tokenType',
      },
      {
        title: '备注',
        dataIndex: 'comment',
      },
      {
        title: 'txid',
        dataIndex: 'txid',
      },
      {
        title: 'taskid',
        dataIndex: 'taskid',
      },
      {
        title: '发送时间',
        dataIndex: 'sendTime',
      },
      {
        title: '确认时间',
        dataIndex: 'confirmTime',
      },
      // {
      //   title: '创建时间',
      //   dataIndex: 'createAt',
      // },
      // {
      //   title: '服务调用次数',
      //   dataIndex: 'callNo',
      //   sorter: true,
      //   align: 'right',
      //   render: val => `${val} 万`,
      //   // mark to display a total number
      //   needTotal: true,
      // },
      // {
      //   title: '状态',
      //   dataIndex: 'status',
      //   filters: [
      //     {
      //       text: status[0],
      //       value: 0,
      //     },
      //     {
      //       text: status[1],
      //       value: 1,
      //     },
      //     {
      //       text: status[2],
      //       value: 2,
      //     },
      //     {
      //       text: status[3],
      //       value: 3,
      //     },
      //   ],
      //   onFilter: (value, record) => record.status.toString() === value,
      //   render(val) {
      //     return <Badge status={statusMap[val]} text={status[val]} />;
      //   },
      // },
      // {
      //   title: '更新时间',
      //   dataIndex: 'updatedAt',
      //   sorter: true,
      //   render: val => <span>{moment(val).format('YYYY-MM-DD HH:mm:ss')}</span>,
      // },
      // {
      //   title: '操作',
      //   render: (item) => {
      //     // console.log(item)
      //     return (
      //       <Fragment>
      //         <a onClick={() => { console.log(item) }}>任务详情</a>
      //         {/* <Divider type="vertical" />
      //         <a href="">订阅警报</a> */}
      //       </Fragment>
      //     )
      //   },
      // },
    ];

    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        {/* <Menu.Item key="remove">删除</Menu.Item> */}
        <Menu.Item key="sendCoin">发送代币</Menu.Item>
      </Menu>
    );

    // const parentMethods = {
    //   sendCoin: this.sendCoin,
    //   handleModalVisible: this.handleModalVisible,
    // };

    return (
      <Card bordered={false}>
        <div className={styles.tableList}>
          <div className={styles.tableListOperator}>
            <Button
              icon="step-backward"
              type="primary"
              onClick={() => {
                this.props.dispatch(routerRedux.push('/coin/coin-overview/taskList'));
              }}
            >
              返回
            </Button>
            {selectedRows.length > 0 && (
              <span>
                <Button>批量操作</Button>
                <Dropdown overlay={menu}>
                  <Button>
                    更多操作 <Icon type="down" />
                  </Button>
                </Dropdown>
              </span>
            )}
          </div>
          <StandardTable
            isSelect
            selectedRows={selectedRows}
            loading={loading}
            data={queryTxOperationRecords}
            columns={columns}
            onSelectRow={this.handleSelectRows}
            onChange={this.handleStandardTableChange}
            showSelect={null}
            scroll={{ x: 2500 }}
          />
        </div>
      </Card>
    );
  }
}
