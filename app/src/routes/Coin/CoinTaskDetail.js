import React, { PureComponent } from 'react';
import { connect } from 'dva';
// import ApolloClient from 'apollo-boost';
// import gql from 'graphql-tag';
import DescriptionList from 'components/DescriptionList';
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
const { Description } = DescriptionList;
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
              确定要发送<span style={{ color: 'red' }}> {selectedRows.length} </span>笔转账吗？
            </p>
          ),
          onOk() {
            return new Promise(resolve => {
              dispatch({
                type: 'coinTask/sendTransactionfFromIds',
                params: selectedRows.map(row => row.id),
                callback: response => {
                  if (response) {
                    message.success('发送成功！');
                    newthis.handleSearch(0, 10);
                  }
                  resolve();
                  newthis.setState({
                    selectedRows: [],
                  });
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
        title: '发送代币数量',
        dataIndex: 'amount',
        editable: true,
      },
      {
        title: '发送状态',
        dataIndex: 'status',
      },
      {
        title: '出账地址',
        dataIndex: 'from',
        editable: true,
      },
      {
        title: '入账地址',
        dataIndex: 'to',
        editable: true,
      },
      {
        title: '代币类型',
        dataIndex: 'tokenType',
      },
    ];

    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        {/* <Menu.Item key="remove">删除</Menu.Item> */}
        <Menu.Item key="sendCoin">发送代币</Menu.Item>
      </Menu>
    );

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
            getCheckboxProps={item => {
              return {
                disabled: item.status === 'pending' || item.status === 'failure' ? false : true,
              };
            }}
            onSelectRow={this.handleSelectRows}
            onChange={this.handleStandardTableChange}
            showSelect={null}
            expandedRowRender={item => {
              return (
                <Card bordered={false}>
                  <DescriptionList col={1} size="large">
                    <Description term="txid">
                      <a href={`https://etherscan.io/tx/${item.txid}`}>{item.txid}</a>
                    </Description>
                    <Description term="发送时间">{item.sendTime}</Description>
                    <Description term="确认时间">{item.confirmTime}</Description>
                    <Description term="创建人">{item.creator}</Description>
                    <Description term="执行人">{item.executer}</Description>
                    <Description term="备注">{item.comment}</Description>
                    <Description term="错误信息">{item.errorMsg}</Description>
                  </DescriptionList>
                </Card>
              );
            }}
          />
        </div>
      </Card>
    );
  }
}
