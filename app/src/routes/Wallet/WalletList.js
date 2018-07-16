import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
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
  Modal,
  // Badge,
  // Divider,
} from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './WalletList.less';

// const { confirm } = Modal;
const FormItem = Form.Item;
const { Option } = Select;
// const getValue = obj =>
//   Object.keys(obj)
//     .map(key => obj[key])
//     .join(',');
// const statusMap = ['default', 'processing', 'success', 'error'];
// const status = ['关闭', '运行中', '已上线', '异常'];

const CreateMultiAccountForm = Form.create()(props => {
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
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="备注">
        {form.getFieldDecorator('comment', {
          validateFirst: true,
        })(<Input style={{ width: '100%' }} placeholder="请输入备注" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="密码">
        {form.getFieldDecorator('password', {
          validateFirst: true,
        })(<Input type="password" style={{ width: '100%' }} placeholder="请输入密码" />)}
      </FormItem>
    </Modal>
  );
});

const CreateSingerAccountForm = Form.create()(props => {
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
      title="创建钱包"
      visible={modalVisible}
      onOk={okHandle}
      confirmLoading={confirmLoading}
      onCancel={() => handleModalVisible()}
    >
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="备注">
        {form.getFieldDecorator('comment', {
          validateFirst: true,
        })(<Input style={{ width: '100%' }} placeholder="请输入备注" />)}
      </FormItem>
      <FormItem labelCol={{ span: 5 }} wrapperCol={{ span: 15 }} label="密码">
        {form.getFieldDecorator('password', {
          validateFirst: true,
        })(<Input type="password" style={{ width: '100%' }} placeholder="请输入密码" />)}
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
    modalVisibleSinger: false,
    expandForm: false,
    selectedRows: [],
    // formValues: {},
    confirmLoading: false,
    confirmLoadingSinger: false,
    pageIndex: 0,
    pageSize: 10,
    showBatchTransfer: false,
  };

  componentDidMount() {
    this.handleSearch(0, 10);
    const { dispatch } = this.props;
    dispatch({
      type: 'wallet/tokenTypeEnum',
    });
  }

  handleFormReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.setState({
      // formValues: {},
    });
  };

  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  };

  handleMenuClick = e => {
    const { dispatch } = this.props;
    const { selectedRows } = this.state;

    switch (e.key) {
      case 'batchTransfer':
        dispatch(
          routerRedux.push({
            pathname: `/coin/coin-createTask/${JSON.stringify(selectedRows)}`,
          })
        );
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
      showBatchTransfer: rows.length > 0,
    });
  };

  handleSearch = (pageIndex, pageSize) => {
    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      if (err) return;
      const newParam = fieldsValue;
      Object.keys(newParam).forEach(item => {
        if (newParam[item] === '') {
          delete newParam[item];
        } else if (item === 'tokenType' && newParam[item] === undefined) {
          newParam[item] = 'eth';
        }
      });
      const newFieldsValue = { ...newParam };
      dispatch({
        type: 'wallet/queryAllBalance',
        params: {
          pageIndex,
          pageSize,
          filter: newFieldsValue,
        },
      });
    });
  };

  handleModalVisible = flag => {
    this.setState({
      modalVisible: !!flag,
    });
  };

  handleModalVisibleSinger = flag => {
    this.setState({
      modalVisibleSinger: !!flag,
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
            comment: fields.comment || '',
            password: fields.password || '',
          },
          callback: response => {
            this.setState({
              confirmLoading: false,
            });
            if (response) {
              const walletAddressList = response.data.createMultiAccount;
              const walletAddressListStr = walletAddressList.join('\n');
              Modal.success({
                title: '创建成功',
                content: `钱包地址为\n${walletAddressListStr}`,
                width: 500,
              });
              this.setState({
                modalVisible: false,
              });
              // message.success(`成功创建 ${fields.walletAmount}个 钱包!`);
            }
          },
        });
      }
    );
  };

  handleStandardTableChange = pagination => {
    this.setState(
      {
        pageIndex: pagination.current - 1,
        pageSize: pagination.pageSize,
      },
      () => {
        this.handleSearch(pagination.current - 1, pagination.pageSize);
      }
    );
  };

  handleAddSinger = fields => {
    this.setState(
      {
        confirmLoadingSinger: true,
      },
      () => {
        this.props.dispatch({
          type: 'wallet/addWallet',
          params: {
            comment: fields.comment || '',
            password: fields.password || '',
          },
          callback: response => {
            this.setState({
              confirmLoadingSinger: false,
            });
            if (response) {
              Modal.success({
                title: '创建成功',
                content: `钱包地址为\n${response.data.createAccount}`,
                width: 500,
              });
              this.setState({
                modalVisibleSinger: false,
              });
              // message.success(`成功创建 1个 钱包!`);
            }
          },
        });
      }
    );
  };

  renderSimpleForm(tokenTypeEnum) {
    const { getFieldDecorator } = this.props.form;
    return (
      <Form
        onSubmit={e => {
          e.preventDefault();
          // this.handleStandardTableChange()
          this.handleSearch(this.state.pageIndex, this.state.pageSize);
        }}
        ayout="inline"
      >
        <Row gutter={{ md: 8, lg: 24, xl: 48 }}>
          <Col md={8} sm={24}>
            <FormItem label="钱包地址">
              {getFieldDecorator('ethAddresses')(<Input placeholder="请输入钱包地址" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24}>
            <FormItem label="代币类型">
              {getFieldDecorator('tokenType', {
                initialValue: tokenTypeEnum[0] && tokenTypeEnum[0].name,
              })(
                <Select placeholder="请选择" style={{ width: '100%' }}>
                  {/* <Option value="Enum(eth)">eth</Option>
                  <Option value="Enum(cre)">cre</Option> */}
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

  renderForm(tokenTypeEnum) {
    return this.state.expandForm ? this.renderAdvancedForm() : this.renderSimpleForm(tokenTypeEnum);
  }

  render() {
    const { wallet: { data, tokenTypeEnum }, loading } = this.props;
    const {
      selectedRows,
      modalVisible,
      confirmLoading,
      modalVisibleSinger,
      confirmLoadingSinger,
    } = this.state;
    const columns = [
      {
        title: '钱包地址',
        dataIndex: 'address',
      },
      {
        title: 'eth余额',
        dataIndex: 'eth',
      },
      {
        title: '所选代笔余额',
        dataIndex: 'token',
      },
      {
        title: '备注',
        dataIndex: 'comment',
      },
      {
        title: '创建时间',
        dataIndex: 'createAt',
      },
    ];
    const menu = (
      <Menu onClick={this.handleMenuClick} selectedKeys={[]}>
        {/* <Menu.Item key="remove">删除</Menu.Item> */}
        <Menu.Item key="approval">批量创建</Menu.Item>
        {this.state.showBatchTransfer ? <Menu.Item key="batchTransfer">批量转账</Menu.Item> : null}
      </Menu>
    );

    const parentMethods = {
      handleAdd: this.handleAdd,
      handleModalVisible: this.handleModalVisible,
    };

    const parentMethodsSinger = {
      handleAdd: this.handleAddSinger,
      handleModalVisible: this.handleModalVisibleSinger,
    };

    return (
      <PageHeaderLayout title="钱包列表">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{this.renderForm(tokenTypeEnum)}</div>
            <div className={styles.tableListOperator}>
              <Button
                icon="plus"
                type="primary"
                onClick={() => {
                  this.handleModalVisibleSinger(true);
                }}
              >
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
              isSelect
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
        <CreateMultiAccountForm
          {...parentMethods}
          modalVisible={modalVisible}
          confirmLoading={confirmLoading}
        />
        <CreateSingerAccountForm
          {...parentMethodsSinger}
          modalVisible={modalVisibleSinger}
          confirmLoading={confirmLoadingSinger}
        />
      </PageHeaderLayout>
    );
  }
}
