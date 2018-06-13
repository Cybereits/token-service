import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
// import ApolloClient from 'apollo-boost';
// import gql from 'graphql-tag';
// import moment from 'moment';
import {
  Row,
  Col,
  Card,
  Form,
  Input,
  Select,
  Icon,
  Button,
  // Dropdown,
  // Menu,
  InputNumber,
  DatePicker,
  Modal,
  message,
  // Badge,
  // Divider,
} from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './CoinSend.less';

const { confirm } = Modal;
const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;

const CreateForm = Form.create()(props => {
  const { modalVisible, form, sendCoin, handleModalVisible, confirmLoading } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) {
        // form.resetFields();
        return;
      }
      sendCoin(fieldsValue);
    });
  };
  return (
    <Modal
      title="发送代币"
      visible={modalVisible}
      onOk={okHandle}
      confirmLoading={confirmLoading}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="处理数量">
        {form.getFieldDecorator('amount', {
          validateFirst: true,
          rules: [
            { required: true, message: '不能为空' },
            {
              validator: (rule, value, callback) => {
                if (isNaN(Number(value)) || value.indexOf('.') >= 0 || value - 0 <= 0) {
                  callback('必须为正整数');
                }
                callback();
              },
            },
          ],
        })(<TextArea style={{ width: '100%' }} placeholder="请输入所要发送到的钱包数量" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="任务类型">
        {form.getFieldDecorator('status', {
          validateFirst: true,
          rules: [],
        })(
          <Select style={{ width: '100%' }} placeholder="请选择">
            <Option value={0}>待处理</Option>
            <Option value={-1}>失败</Option>
          </Select>
        )}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="出账钱包地址">
        {form.getFieldDecorator('address', {
          validateFirst: true,
          rules: [],
        })(<Input style={{ width: '100%' }} placeholder="请输入出账钱包地址" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="秘钥">
        {form.getFieldDecorator('secret', {
          validateFirst: true,
          rules: [],
        })(<Input style={{ width: '100%' }} placeholder="请输入出账钱包地址的秘钥" />)}
      </FormItem>
    </Modal>
  );
});

@connect(({ coin, loading }) => ({
  coin,
  loading: loading.models.coin,
}))
@Form.create()
export default class TableList extends PureComponent {
  state = {
    modalVisible: false,
    expandForm: false,
    selectedRows: [],
    // formValues: {},
    confirmLoading: false,
  };

  componentDidMount() {
    this.handleSearch(0, 10);
    const { dispatch } = this.props;
    dispatch({
      type: 'coin/commonStatusEnum',
    });
    dispatch({
      type: 'coin/tokenTypeEnum',
    });
  }

  handleStandardTableChange = pagination => {
    // const { dispatch } = this.props;
    // const { formValues } = this.state;

    // const filters = Object.keys(filtersArg).reduce((obj, key) => {
    //   const newObj = { ...obj };
    //   newObj[key] = getValue(filtersArg[key]);
    //   return newObj;
    // }, {});

    // const params = {
    //   currentPage: pagination.current,
    //   pageSize: pagination.pageSize,
    //   ...formValues,
    //   ...filters,
    // };
    // if (sorter.field) {
    //   params.sorter = `${sorter.field}_${sorter.order}`;
    // }

    // dispatch({
    //   type: 'rule/fetch',
    //   payload: params,
    // });
    this.handleSearch(pagination.current - 1, pagination.pageSize);
    // dispatch({
    //   type: 'coin/queryPrizeList',
    //   params: {
    //     pageIndex: pagination.current - 1,
    //     pageSize: pagination.pageSize,
    //     filter: this.state.formValues,
    //   },
    // });
  };

  handleFormReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.setState({
      // formValues: {},
    });
    // dispatch({
    //   type: 'rule/fetch',
    //   payload: {},
    // });
  };

  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  };

  handleMenuClick = e => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    // if (!selectedRows) return;

    switch (e.key) {
      case 'remove':
        dispatch({
          type: 'coin/remove',
          payload: {
            no: selectedRows.map(row => row.no).join(','),
          },
          callback: () => {
            this.setState({
              selectedRows: [],
            });
          },
        });
        break;
      case 'approval':
        this.handleModalVisible(true);
        break;
      default:
        break;
    }
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = (pageIndex, pageSize) => {
    // dispatch({
    //   type: 'rule/queryAllBalance',
    // });
    // e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const newParam = fieldsValue;
      Object.keys(newParam).forEach(item => {
        if (newParam[item] === '') {
          delete newParam[item];
        } else if (item === 'tokenType' && newParam[item]) {
          newParam[item] = `Enum(${newParam[item]})`;
        } else if (item === 'status' && newParam[item]) {
          newParam[item] = `Enum(${newParam[item]})`;
        } else if (item === 'amount' && newParam[item]) {
          newParam[item] = +newParam[item];
        }
      });
      const newFieldsValue = { tokenType: 'Enum()', ...newParam };
      dispatch({
        type: 'coin/queryTx',
        params: {
          pageIndex,
          pageSize,
          filter: newFieldsValue,
        },
      });
    });
  };

  sendCoin = fields => {
    this.setState(
      {
        confirmLoading: true,
      },
      () => {
        this.props.dispatch({
          type: 'coin/handlePrizes',
          params: fields,
          callback: res => {
            this.setState({
              modalVisible: false,
              confirmLoading: false,
            });
            if (res) {
              message.success(`成功创建 ${fields.amount}个 任务队列!`);
            }
          },
        });
      }
    );
  };

  addWallet = () => {
    const { dispatch } = this.props;
    confirm({
      title: '确定创建一个钱包吗？',
      onOk() {
        return new Promise(resolve => {
          dispatch({
            type: 'coin/addWallet',
            params: {},
            callback: () => {
              message.success('创建钱包成功!');
              resolve();
            },
          });
        });
      },
      onCancel() {
        console.log('Cancel');
      },
    });
  };

  renderSimpleForm(statusEnum, tokenTypeEnum) {
    const { getFieldDecorator } = this.props.form;
    const formItemLayout = {
      labelCol: {
        xl: { span: 6 },
        md: { span: 8 },
        sm: { span: 4 },
        xs: { span: 4 },
      },
      wrapperCol: {
        xl: { span: 18 },
        md: { span: 16 },
        sm: { span: 20 },
        xs: { span: 20 },
      },
    };
    return (
      <Form
        onSubmit={() => {
          this.handleSearch(0, 10);
        }}
        layout="inline"
      >
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24} xs={24}>
            <FormItem {...formItemLayout} label="入账地址">
              {getFieldDecorator('to')(<Input placeholder="请输入入账地址" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24} xs={24}>
            <FormItem {...formItemLayout} label="状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  {statusEnum.map((item, index) => {
                    return (
                      /* eslint-disable */
                      <Option key={index} value={item.name}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24} xs={24}>
            <FormItem {...formItemLayout} label="发送数量">
              {getFieldDecorator('amount')(<Input placeholder="请输入发送数量" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24} xs={24}>
            <FormItem {...formItemLayout} label="代币类型">
              {getFieldDecorator('tokenType')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  {tokenTypeEnum.map((item, index) => {
                    return (
                      /* eslint-disable */
                      <Option key={index} value={item.name}>
                        {item.name}
                      </Option>
                    );
                  })}
                </Select>
              )}
            </FormItem>
          </Col>
          <div style={{ overflow: 'hidden' }}>
            <span style={{ float: 'right', marginBottom: 24 }}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
              {/* <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                收起 <Icon type="up" />
              </a> */}
            </span>
          </div>
        </Row>
      </Form>
    );
  }

  renderAdvancedForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form onSubmit={this.handleSearch} layout="inline">
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="规则编号">
              {getFieldDecorator('no')(<Input placeholder="请输入" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="调用次数">
              {getFieldDecorator('number')(<InputNumber style={{ width: '100%' }} />)}
            </FormItem>
          </Col>
        </Row>
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="更新日期">
              {getFieldDecorator('date')(
                <DatePicker style={{ width: '100%' }} placeholder="请输入更新日期" />
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status3')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status4')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col>
        </Row>
        <div style={{ overflow: 'hidden' }}>
          <span style={{ float: 'right', marginBottom: 24 }}>
            <Button type="primary" htmlType="submit">
              查询
            </Button>
            <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
              重置
            </Button>
            <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
              收起 <Icon type="up" />
            </a>
          </span>
        </div>
      </Form>
    );
  }

  renderForm(statusEnum, tokenTypeEnum) {
    return this.state.expandForm
      ? this.renderAdvancedForm()
      : this.renderSimpleForm(statusEnum, tokenTypeEnum);
  }

  render() {
    const { coin: { data, statusEnum, tokenTypeEnum }, loading } = this.props;
    const { selectedRows, modalVisible, confirmLoading } = this.state;
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
        title: '发送代币数量',
        dataIndex: 'amount',
      },
      {
        title: '出账地址',
        dataIndex: 'from',
      },
      {
        title: '发送状态',
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
        title: '任务id',
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
      {
        width: 100,
        title: '操作',
        fixed: 'right',
        render: item => {
          const { dispatch } = this.props;
          const newThis = this;
          return (
            <Fragment>
              <a
                disabled={item.status === 'pending' || item.status === 'failure' ? false : true}
                onClick={function() {
                  confirm({
                    okText: '确认',
                    cancelText: '取消',
                    title: <p>确定要发送此比转账吗？</p>,
                    onOk() {
                      return new Promise(resolve => {
                        dispatch({
                          type: 'coinTask/sendTransactionfFromIds',
                          params: [item.id],
                          callback: () => {
                            message.success('发送成功！');
                            resolve();
                            newThis.handleSearch(0, 10);
                          },
                        });
                      });
                    },
                    onCancel() {},
                  });
                }}
              >
                发送代币
              </a>
            </Fragment>
          );
        },
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
      // {
      //   title: '操作',
      //   render: () => (
      //     <Fragment>
      //       <a href="">配置</a>
      //       <Divider type="vertical" />
      //       <a href="">订阅警报</a>
      //     </Fragment>
      //   ),
      // },
    ];
    // const menu = (
    //   <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
    //     {/* <Menu.Item key="remove">删除</Menu.Item> */}
    //     <Menu.Item key="approval">批量创建</Menu.Item>
    //   </Menu>
    // );

    const parentMethods = {
      sendCoin: this.sendCoin,
      handleModalVisible: this.handleModalVisible,
    };

    return (
      <PageHeaderLayout title="代币发放">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm(statusEnum, tokenTypeEnum)}</div>
            <div className={styles.tableListOperator}>
              {/* <Button
                icon="rocket"
                type="primary"
                onClick={() => {
                  this.handleModalVisible(true);
                }}
              >
                创建发送任务
              </Button> */}
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
              data={data}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
              scroll={{ x: 3000 }}
            />
          </div>
        </Card>
        <CreateForm
          {...parentMethods}
          modalVisible={modalVisible}
          confirmLoading={confirmLoading}
        />
      </PageHeaderLayout>
    );
  }
}
