import React, { PureComponent } from 'react';
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
  Dropdown,
  Menu,
  InputNumber,
  DatePicker,
  Modal,
  message,
  // Badge,
  // Divider,
} from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './WalletList.less';

const { confirm } = Modal;
const FormItem = Form.Item;
const { Option } = Select;
// const getValue = obj =>
//   Object.keys(obj)
//     .map(key => obj[key])
//     .join(',');
// const statusMap = ['default', 'processing', 'success', 'error'];
// const status = ['关闭', '运行中', '已上线', '异常'];

const CreateForm = Form.create()(props => {
  const { modalVisible, form, handleAdd, handleModalVisible, confirmLoading } = props;
  const okHandle = () => {
    form.validateFields((err, fieldsValue) => {
      if (err) {
        // form.resetFields();
        return;
      }
      handleAdd(fieldsValue);
    });
  };
  return (
    <Modal
      title="批量创建钱包"
      visible={modalVisible}
      onOk={okHandle}
      confirmLoading={confirmLoading}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="钱包数量">
        {form.getFieldDecorator('walletAmount', {
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
        })(<Input style={{ width: '100%' }} placeholder="请输入所要创建的钱包数量" />)}
      </FormItem>
    </Modal>
  );
});

@connect(({ wallet, loading }) => ({
  wallet,
  loading: loading.models.wallet,
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
          type: 'wallet/remove',
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

  // handleSearch = (pageIndex, pageSize) => {
  //   // dispatch({
  //   //   type: 'rule/queryAllBalance',
  //   // });
  //   e.preventDefault();

  //   const { dispatch, form } = this.props;

  //   form.validateFields((err, fieldsValue) => {
  //     if (err) return;
  //     if (!fieldsValue.walletAddress) {
  //       dispatch({
  //         type: 'wallet/queryAllBalance',
  //       });
  //     } else {
  //       dispatch({
  //         type: 'wallet/queryAllBalance',
  //         params: {
  //           pageIndex: 0,
  //           pageSize: 10,
  //           filter: {
  //             "ethAddresses": [fieldsValue.walletAddress],
  //           },
  //         },
  //       });
  //     }
  //     console.log(fieldsValue)
  //     console.log(fieldsValue)
  //     // const values = {
  //     //   ...fieldsValue,
  //     //   updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
  //     // };

  //     // this.setState({
  //     //   formValues: values,
  //     // });

  //   });
  // };

  handleSearch = (pageIndex, pageSize) => {
    // dispatch({
    //   type: 'rule/queryAllBalance',
    // });
    // e.preventDefault();

    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      // this.setState({
      //   formValues: fieldsValue,
      // });
      const newParam = fieldsValue;
      Object.keys(newParam).forEach(item => {
        if (newParam[item] === '') {
          delete newParam[item];
        }
      });
      const newFieldsValue = { orderBy: 'Enum(eth)', ...newParam };
      dispatch({
        type: 'wallet/queryAllBalance',
        params: {
          pageIndex,
          pageSize,
          filter: newFieldsValue,
        },
      });
      // const values = {
      //   ...fieldsValue,
      //   updatedAt: fieldsValue.updatedAt && fieldsValue.updatedAt.valueOf(),
      // };
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleAdd = fields => {
    this.setState(
      {
        confirmLoading: true,
      },
      () => {
        this.props.dispatch({
          type: 'wallet/createMultiAccount',
          params: {
            walletAmount: fields.walletAmount,
          },
          callback: res => {
            this.setState({
              modalVisible: false,
              confirmLoading: false,
            });
            if (res) {
              message.success(`成功创建了 ${fields.walletAmount}个 钱包!`);
            }
          },
        });
      }
    );
  };

  addWallet = () => {
    const { dispatch } = this.props;
    confirm({
      okText: '确认',
      cancelText: '取消',
      title: '确定创建一个钱包吗？',
      onOk() {
        return new Promise(resolve => {
          dispatch({
            type: 'wallet/addWallet',
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

  renderSimpleForm() {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form
        onSubmit={() => {
          this.handleSearch(0, 10);
        }}
        ayout="inline"
      >
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="钱包地址">
              {getFieldDecorator('ethAddresses')(<Input placeholder="请输入钱包地址" />)}
            </FormItem>
          </Col>
          {/* <Col md={8} sm={24}>
            <FormItem label="使用状态">
              {getFieldDecorator('status')(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  <Option value="0">关闭</Option>
                  <Option value="1">运行中</Option>
                </Select>
              )}
            </FormItem>
          </Col> */}
          <Col md={8} sm={24}>
            <span className={styles.submitButtons}>
              <Button type="primary" htmlType="submit">
                查询
              </Button>
              <Button style={{ marginLeft: 8 }} onClick={this.handleFormReset}>
                重置
              </Button>
              {/* <a style={{ marginLeft: 8 }} onClick={this.toggleForm}>
                展开 <Icon type="down" />
              </a> */}
            </span>
          </Col>
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

  renderForm() {
    return this.state.expandForm ? this.renderAdvancedForm() : this.renderSimpleForm();
  }

  render() {
    const { wallet: { data }, loading } = this.props;
    const { selectedRows, modalVisible, confirmLoading } = this.state;
    const columns = [
      {
        title: '钱包地址',
        dataIndex: 'ethAddress',
      },
      {
        title: 'eth余额',
        dataIndex: 'ethAmount',
      },
      {
        title: 'cre余额',
        dataIndex: 'creAmount',
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
    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        {/* <Menu.Item key="remove">删除</Menu.Item> */}
        <Menu.Item key="approval">批量创建</Menu.Item>
      </Menu>
    );

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };

    return (
      <PageHeaderLayout title="钱包列表">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm()}</div>
            <div className={styles.tableListOperator}>
              <Button icon="plus" type="primary" onClick={this.addWallet.bind(this)}>
                创建钱包
              </Button>
              <span>
                {/* <Button>批量操作</Button> */}
                <Dropdown overlay={menu}>
                  <Button>
                    更多操作 <Icon type="down" />
                  </Button>
                </Dropdown>
              </span>
            </div>
            <StandardTable
              selectedRows={selectedRows}
              loading={loading}
              data={data}
              columns={columns}
              onSelectRow={this.handleSelectRows}
              onChange={this.handleStandardTableChange}
              showSelect={null}
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
