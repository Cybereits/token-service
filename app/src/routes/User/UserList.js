import React, { PureComponent } from 'react';
import { connect } from 'dva';
// import DescriptionList from 'components/DescriptionList';
import {
  //   Row,
  //   Col,
  Card,
  Form,
  Input,
  Select,
  Modal,
  //   message,
  // Badge,
  // Divider,
} from 'antd';
import StandardTable from 'components/StandardTable';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
import styles from './UserList.less';

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

@connect(({ user, loading }) => ({
  user,
  loading: loading.models.user,
}))
@Form.create()
export default class UserList extends PureComponent {
  state = {
    modalVisible: false,
    // expandForm: false,
    selectedRows: [],
    // formValues: {},
    confirmLoading: false,
  };

  componentDidMount() {
    this.handleSearch(0, 10);
    const { dispatch } = this.props;
    dispatch({
      type: 'user/queryAdminList',
    });
  }

  handleSearch = (pageIndex, pageSize) => {
    // dispatch({
    //   type: 'rule/queryAllBalance',
    // });
    // e.preventDefault();

    const { dispatch } = this.props;
    dispatch({
      type: 'user/queryAdminList',
      params: {
        pageIndex,
        pageSize,
      },
    });
  };

  handleStandardTableChange = pagination => {
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

  render() {
    const { user: { data }, loading } = this.props;
    console.log(data);
    const { selectedRows, modalVisible, confirmLoading } = this.state;
    const columns = [
      {
        title: '用户名',
        dataIndex: 'username',
      },
      {
        title: '角色',
        dataIndex: 'role',
      },
    ];

    const parentMethods = {
      sendCoin: this.sendCoin,
      handleModalVisible: this.handleModalVisible,
    };

    return (
      <PageHeaderLayout title="用户列表">
        <Card bordered={false}>
          <div className={styles.tableList}>
            <div className={styles.tableListForm}>{}</div>
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
