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
  // Icon,
  Button,
  // Dropdown,
  // Menu,
  // InputNumber,
  // DatePicker,
  // Modal,
  // message,
  // Badge,
  // Divider,
} from 'antd';
import StandardTable from 'components/StandardTable';
// import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './CoinSend.less';
// import { getQueryVariable } from '../../utils/utils';

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

  render() {
    console.log(this.props);
    const { coinTask: { queryTxOperationRecords }, loading } = this.props;
    const { selectedRows } = this.state;
    console.log(this.props);
    const columns = [
      {
        title: '出账地址',
        dataIndex: 'from',
      },
      {
        title: '入账地址',
        dataIndex: 'to',
      },
      {
        title: '转账数量',
        dataIndex: 'amount',
      },
      {
        title: '代币类型',
        dataIndex: 'tokenType',
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
            {/* <span>
                 <Button>批量操作</Button> 
                <Dropdown overlay={menu}>
                  <Button>
                    更多操作 <Icon type="down" />
                  </Button>
                </Dropdown>
              </span> */}
          </div>
          <StandardTable
            selectedRows={selectedRows}
            loading={loading}
            data={queryTxOperationRecords}
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
