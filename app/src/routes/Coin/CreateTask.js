import React, { PureComponent } from 'react';
import { connect } from 'dva';
import StandardTable from 'components/StandardTable';
import { routerRedux } from 'dva/router';
import {
  Form,
  Input,
  Modal,
  Tabs,
  // DatePicker,
  Select,
  Button,
  Card,
  message,
  // InputNumber,
  // Radio,
  // Icon,
  // Tooltip,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
// import styles from './CoinSend.less';

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;
const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 7 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 12 },
    md: { span: 10 },
  },
};

const submitFormLayout = {
  wrapperCol: {
    xs: { span: 24, offset: 0 },
    sm: { span: 10, offset: 7 },
  },
};

const PreViewList = ({ visible, okHandle, confirmLoading, handleModalVisible, data }) => {
  const newData = {
    list: data.list.slice(0, 5),
  };
  const columns = [
    {
      title: '出账地址',
      dataIndex: 'outAccount',
    },
    {
      title: '入账地址',
      dataIndex: 'to',
    },
    {
      title: '数量',
      dataIndex: 'amount',
    },
    {
      title: '代币类型',
      dataIndex: 'tokenType',
    },
    {
      title: '备注',
      dataIndex: 'comment',
    },
  ];
  return (
    <Modal
      width={1000}
      title="确认创建任务"
      visible={visible}
      onOk={okHandle}
      confirmLoading={confirmLoading}
      onCancel={() => handleModalVisible()}
    >
      <StandardTable
        selectedRows={[]}
        data={newData}
        columns={columns}
        onSelectRow={this.handleSelectRows}
        onChange={this.handleStandardTableChange}
        showSelect={null}
        showPaginationProps={false}
      />
      <div
        style={{
          color: 'rgba(0, 0, 0, 0.85)',
          display: 'flex',
          justifyContent: 'center',
          marginTop: '9px',
        }}
      >
        ...
      </div>
      <div
        style={{
          color: 'rgba(0, 0, 0, 0.85)',
          fontWeight: '500',
          display: 'flex',
          justifyContent: 'center',
          marginTop: '9px',
        }}
      >
        此任务下共有{data.list.length}笔transaction, 最多为您想显示前5条transaction, 供您核对信息。
      </div>
    </Modal>
  );
};

/* eslint-disable*/
class SingleAddress extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { submitting, handleSubmit, textAddressList, tokenTypeEnum } = this.props;
    const { getFieldDecorator, validateFieldsAndScroll } = this.props.form;
    return (
      <div>
        <Form
          onSubmit={e => {
            handleSubmit(e, validateFieldsAndScroll);
          }}
          style={{ marginTop: 8 }}
        >
          <FormItem {...formItemLayout} label="transactions">
            {getFieldDecorator('transactions', {
              initialValue: textAddressList,
              rules: [
                {
                  whitespace: true,
                  required: true,
                  message: 'transactions为必填项',
                },
              ],
            })(
              <TextArea autosize={{ minRows: 10, maxRows: 20 }} placeholder="请输入transactions" />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="代币类型">
            {getFieldDecorator('tokenType', {
              validateFirst: true,
              rules: [
                {
                  required: true,
                  message: '代币类型为必填项',
                },
              ],
            })(
              <Select style={{ width: '100%' }} placeholder="请选择">
                {tokenTypeEnum.map((item, index) => {
                  return (
                    /* eslint-disable */
                    <Option key={index} value={item.value}>
                      {item.name}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="出账地址">
            {getFieldDecorator('outAccount', {
              validateFirst: true,
              rules: [
                {
                  whitespace: true,
                  required: true,
                  message: '出账地址为必填项',
                },
              ],
            })(<Input style={{ width: '100%' }} placeholder="请输入出账钱包地址" />)}
          </FormItem>
          <FormItem {...formItemLayout} label="备注">
            {getFieldDecorator('comment', {
              validateFirst: true,
              rules: [
                {
                  whitespace: true,
                  required: true,
                  message: '备注为必填项',
                },
              ],
            })(<Input style={{ width: '100%' }} placeholder="请输入备注" />)}
          </FormItem>
          <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

/* eslint-disable*/
class MultipleAddress extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { submitting, handleSubmit, tokenTypeEnum, textAddressList } = this.props;
    const { getFieldDecorator, validateFieldsAndScroll } = this.props.form;
    return (
      <div>
        <Form
          onSubmit={e => {
            handleSubmit(e, validateFieldsAndScroll);
          }}
          style={{ marginTop: 8 }}
        >
          <FormItem {...formItemLayout} label="transactions">
            {getFieldDecorator('transactions', {
              initialValue: textAddressList,
              rules: [
                {
                  whitespace: true,
                  required: true,
                  message: 'transactions为必填项',
                },
              ],
            })(
              <TextArea autosize={{ minRows: 10, maxRows: 20 }} placeholder="请输入transactions" />
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="代币类型">
            {getFieldDecorator('tokenType', {
              validateFirst: true,
              rules: [
                {
                  required: true,
                  message: '代币类型为必填项',
                },
              ],
            })(
              <Select style={{ width: '100%' }} placeholder="请选择">
                {tokenTypeEnum.map((item, index) => {
                  return (
                    /* eslint-disable */
                    <Option key={index} value={item.value}>
                      {item.name}
                    </Option>
                  );
                })}
              </Select>
            )}
          </FormItem>
          <FormItem {...formItemLayout} label="备注">
            {getFieldDecorator('comment', {
              validateFirst: true,
              rules: [
                {
                  whitespace: true,
                  required: true,
                  message: '备注为必填项',
                },
              ],
            })(<Input style={{ width: '100%' }} placeholder="请输入备注" />)}
          </FormItem>
          <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
            <Button type="primary" htmlType="submit">
              提交
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

const SingleAddress_ = Form.create({})(SingleAddress);
const MultipleAddress_ = Form.create({})(MultipleAddress);

@connect(({ coinTask, loading }) => ({
  coinTask,
  submittingSingleAddress_: loading.effects['coinTask/createBatchTransactions'],
  submittingMultipleAddress_: loading.effects['coinTask/createBatchTransactions'],
}))
export default class CreateTask extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      data: { list: [] },
      visible: false,
      activeKey: '1',
      addressList: props.match.params.addressList
        ? JSON.parse(props.match.params.addressList)
        : null,
    };
  }

  componentDidMount = () => {
    const { addressList } = this.state;
    if (addressList) {
      const newAddressList = addressList.map(value => {
        return `${value.address},0`;
      });
      this.setState({
        textAddressList: newAddressList.join('\n'),
      });
    }
    this.props.dispatch({
      type: 'coinTask/tokenTypeEnum',
    });
  };

  createBatchTransactions = () => {
    this.props.dispatch({
      type: 'coinTask/createBatchTransactions',
      params: this.state.newParams,
      callback: response => {
        if (response) {
          message.success('创建转账任务成功！');
          this.props.dispatch(
            routerRedux.push({
              pathname: '/coin/coin-overview/taskList',
            })
          );
        }
      },
    });
  };

  handleModalVisible = () => {
    this.setState({
      visible: !this.state.visible,
    });
  };

  handleSubmitSingle = (e, validateFieldsAndScroll) => {
    e.preventDefault();
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        const newParams = {
          transaction: [],
          comment: values.comment,
        };
        encodeURIComponent(values.transactions)
          .split('%0A')
          .forEach((item, index) => {
            newParams.transaction.push({
              outAccount: values.outAccount,
              to: item.split('%2C')[0],
              amount: +item.split('%2C')[1],
              tokenType: values.tokenType,
              comment: values.comment,
              key: index,
            });
          });
        this.setState(
          {
            newParams,
            data: {
              list: newParams.transaction,
            },
            visible: !this.state.visible,
          },
          () => {
            console.log(this.state.data);
          }
        );
      }
    });
  };

  handleSubmitMultiple = (e, validateFieldsAndScroll) => {
    e.preventDefault();
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        const newParams = {
          transaction: [],
          comment: values.comment,
        };
        encodeURIComponent(values.transactions)
          .split('%0A')
          .forEach((item, index) => {
            newParams.transaction.push({
              outAccount: item.split('%2C')[2],
              to: item.split('%2C')[0],
              amount: +item.split('%2C')[1],
              tokenType: values.tokenType,
              comment: values.comment,
              key: index,
            });
          });
        this.setState(
          {
            newParams,
            data: {
              list: newParams.transaction,
            },
            visible: !this.state.visible,
          },
          () => {
            console.log(this.state.data);
          }
        );
      }
    });
  };
  render() {
    const {
      submittingSingleAddress_,
      submittingMultipleAddress_,
      coinTask: { tokenTypeEnum },
    } = this.props;

    return (
      <PageHeaderLayout title="创建转账任务">
        <Tabs
          onChange={activeKey => {
            this.setState({
              activeKey,
            });
          }}
          defaultActiveKey="1"
          size="large"
          tabBarStyle={{ backgroundColor: '#fff', marginBottom: 0 }}
        >
          <TabPane tab="批量转出" key="1">
            <Card bordered={false}>
              <SingleAddress_
                submitting={submittingSingleAddress_}
                handleSubmit={(e, validateFieldsAndScroll) => {
                  this.handleSubmitSingle(e, validateFieldsAndScroll);
                }}
                textAddressList={this.state.textAddressList}
                tokenTypeEnum={tokenTypeEnum}
              />
            </Card>
          </TabPane>
          <TabPane tab="批量转账" key="2">
            <Card bordered={false}>
              <MultipleAddress_
                submitting={submittingMultipleAddress_}
                handleSubmit={(e, validateFieldsAndScroll) => {
                  this.handleSubmitMultiple(e, validateFieldsAndScroll);
                }}
                textAddressList={this.state.textAddressList}
                tokenTypeEnum={tokenTypeEnum}
              />
            </Card>
          </TabPane>
        </Tabs>
        <PreViewList
          data={this.state.data}
          visible={this.state.visible}
          okHandle={this.createBatchTransactions}
          handleModalVisible={this.handleModalVisible}
          confirmLoading={
            this.state.activeKey === '1' ? submittingSingleAddress_ : submittingMultipleAddress_
          }
        />
      </PageHeaderLayout>
    );
  }
}
