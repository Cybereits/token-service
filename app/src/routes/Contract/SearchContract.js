import React, { PureComponent } from 'react';
import { connect } from 'dva';
// import DescriptionList from 'components/DescriptionList';
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
  // message,
  // Badge,
  // Divider,
} from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './contract.less';

// const { confirm } = Modal;
const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
// const { Description } = DescriptionList;
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

@connect(({ contract, loading }) => ({
  contract,
  loading: loading.models.contract,
}))
@Form.create()
export default class SearchContract extends PureComponent {
  state = {
    modalVisible: false,
    expandForm: false,
    selectedRows: [],
    // formValues: {},
    confirmLoading: false,
  };

  componentDidMount() {
    this.props.dispatch({
      type: 'contract/queryAllContract',
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
  };

  toggleForm = () => {
    this.setState({
      expandForm: !this.state.expandForm,
    });
  };

  handleSelectRows = rows => {
    this.setState({
      selectedRows: rows,
    });
  };

  handleSearch = () => {
    const { dispatch, form } = this.props;
    form.validateFields((err, fieldsValue) => {
      // console.log(fieldsValue)
      if (err) return;
      const newParam = fieldsValue;
      Object.keys(newParam).forEach(item => {
        if (newParam[item] === '') {
          delete newParam[item];
        }
      });
      const newFieldsValue = { ...fieldsValue };
      console.log(newFieldsValue);
      dispatch({
        type: 'contract/queryAllContract',
        params: newFieldsValue,
      });
    });
  };

  renderSimpleForm() {
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
            <FormItem {...formItemLayout} label="合约名称">
              {getFieldDecorator('name')(<Input placeholder="请输入合约名称" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24} xs={24}>
            <FormItem {...formItemLayout} label="代币缩写">
              {getFieldDecorator('symbol')(<Input placeholder="请输入代币缩写" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24} xs={24}>
            <FormItem {...formItemLayout} label="所属地址">
              {getFieldDecorator('owner')(<Input placeholder="请输入所属地址" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24} xs={24}>
            <FormItem {...formItemLayout} label="合约地址">
              {getFieldDecorator('address')(<Input placeholder="请输入合约地址" />)}
            </FormItem>
          </Col>
          <Col md={8} sm={24} xs={24}>
            <FormItem {...formItemLayout} label="是否是ERC20代币合约">
              {getFieldDecorator('isERC20')(
                <Select placeholder="请选择">
                  {/*eslint-disable*/}
                  <Option value={true}>是</Option>
                  <Option value={false}>否</Option>
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
    const { contract: { data, statusEnum, tokenTypeEnum }, loading } = this.props;
    const { selectedRows, modalVisible, confirmLoading } = this.state;
    const columns = [
      {
        title: '合约名称',
        dataIndex: 'name',
        // fixed: 'left',
      },
      {
        title: '代币缩写',
        dataIndex: 'symbol',
      },
      {
        title: '代币精度',
        dataIndex: 'decimal',
      },
      // {
      //   title: '合约编码',
      //   dataIndex: 'codes',
      // },
      // {
      //   title: '合约',
      //   dataIndex: 'abis',
      // },
      {
        title: '合约拥有者',
        dataIndex: 'owner',
      },
      {
        title: '合约地址',
        dataIndex: 'address',
      },
      // {
      //   title: '合约部署参数',
      //   dataIndex: 'args',
      // },
      {
        title: '是否是ERC20代币合约',
        dataIndex: 'isERC20',
      },
      {
        title: '合约创建时间',
        dataIndex: 'createAt',
      },
    ];

    const parentMethods = {
      sendCoin: this.sendCoin,
      handleModalVisible: this.handleModalVisible,
    };

    return (
      <PageHeaderLayout title="合约查询">
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
