import React, { PureComponent } from 'react';
import { connect } from 'dva';
// import { routerRedux } from 'dva/router';
import {
  Form,
  Input,
  // DatePicker,
  // Select,
  Button,
  Card,
  message,
  // InputNumber,
  // Radio,
  // Icon,
  // Tooltip,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
// import styles from '../Wallet/WalletList.less';

const FormItem = Form.Item;

@connect(({ coinTask, loading }) => ({
  coinTask,
  submitting: loading.effects['user/createAdmin'],
}))
@Form.create()
export default class CreateUser extends PureComponent {
  componentDidMount = () => {
    this.props.dispatch({
      type: 'coinTask/tokenTypeEnum',
    });
  };

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const newValues = { ...values };
        this.props.dispatch({
          type: 'user/createAdmin',
          params: newValues,
          callback: () => {
            message.success('创建用户成功!');
          },
        });
      }
    });
  };
  render() {
    const { submitting } = this.props;
    const { getFieldDecorator } = this.props.form;

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

    return (
      <PageHeaderLayout title="创建用户">
        <Card bordered={false}>
          <Form onSubmit={this.handleSubmit} style={{ marginTop: 8 }}>
            <FormItem {...formItemLayout} label="用户名">
              {getFieldDecorator('username', {
                validateFirst: true,
                rules: [
                  {
                    whitespace: true,
                    required: true,
                    message: '用户名为必填项',
                  },
                ],
              })(<Input style={{ width: '100%' }} placeholder="请输入用户名" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="密码">
              {getFieldDecorator('password', {
                validateFirst: true,
                rules: [
                  {
                    whitespace: true,
                    required: true,
                    message: '密码为必填项',
                  },
                ],
              })(<Input type="password" style={{ width: '100%' }} placeholder="请输入密码" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="确认密码">
              {getFieldDecorator('validPassword', {
                validateFirst: true,
                rules: [
                  {
                    whitespace: true,
                    required: true,
                    message: '确认密码为必填项',
                  },
                ],
              })(<Input type="password" style={{ width: '100%' }} placeholder="请再次输入密码" />)}
            </FormItem>
            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              <Button type="primary" htmlType="submit" loading={submitting}>
                创建
              </Button>
              {/* <Button style={{ marginLeft: 8 }}>保存</Button> */}
            </FormItem>
          </Form>
        </Card>
      </PageHeaderLayout>
    );
  }
}
