import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
// import ApolloClient from 'apollo-boost';
// import gql from 'graphql-tag';
// import moment from 'moment';
import { routerRedux } from 'dva/router';
import {
  //   Row,
  //   Col,
  Card,
  //   Form,
  //   Input,
  //   Select,
  //   Icon,
  //   Button,
  //   Dropdown,
  //   Menu,
  //   InputNumber,
  //   DatePicker,
  Modal,
  message,
  //   Badge,
  Divider,
} from 'antd';
import StandardTable from 'components/StandardTable';
// import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './CoinSend.less';

const { confirm } = Modal;

@connect(({ coinTask, loading }) => ({
  coinTask,
  loading: loading.models.coinTask,
}))
export default class CoinTaskList extends PureComponent {
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
      type: 'coinTask/queryBatchTrasactionTasks',
      params: {
        pageIndex,
        pageSize,
      },
    });
  };

  handleStandardTableChange = pagination => {
    this.handleSearch(pagination.current - 1, pagination.pageSize);
  };

  render() {
    const { coinTask: { queryBatchTrasactionTasks }, loading } = this.props;
    const { selectedRows } = this.state;
    const columns = [
      {
        title: '任务id',
        dataIndex: 'id',
      },
      {
        title: '发送笔数',
        dataIndex: 'count',
      },
      {
        title: '备注',
        dataIndex: 'comment',
      },
      {
        title: '创建时间',
        dataIndex: 'createAt',
      },
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
      {
        title: '操作',
        render: item => {
          return (
            <Fragment>
              <a
                onClick={() => {
                  this.props.dispatch(
                    routerRedux.push({
                      pathname: `/coin/coin-overview/taskDetail/${item.id}`,
                    })
                  );
                }}
              >
                任务详情
              </a>
              <Divider type="vertical" />
              <a
                onClick={() => {
                  const { dispatch } = this.props;
                  confirm({
                    title: (
                      <p>
                        确定要发送此任务下的<span style={{ color: 'red' }}> {item.count} </span>笔转账吗？
                      </p>
                    ),
                    onOk() {
                      return new Promise(resolve => {
                        dispatch({
                          type: 'coinTask/sendTransactionfFromTaskid',
                          params: item.id,
                          callback: () => {
                            message.success('发送成功！');
                            resolve();
                          },
                        });
                      });
                    },
                    onCancel() {
                      console.log('Cancel');
                    },
                  });
                }}
              >
                发送代币
              </a>
            </Fragment>
          );
        },
      },
    ];

    // const parentMethods = {
    //   sendCoin: this.sendCoin,
    //   handleModalVisible: this.handleModalVisible,
    // };

    return (
      <Card bordered={false}>
        <div className={styles.tableList}>
          <StandardTable
            selectedRows={selectedRows}
            loading={loading}
            data={queryBatchTrasactionTasks}
            columns={columns}
            onSelectRow={this.handleSelectRows}
            onChange={this.handleStandardTableChange}
            showSelect={null}
          />
        </div>
      </Card>
    );
  }
}
