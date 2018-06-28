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
// import styles from './CoinSend.less';

const FormItem = Form.Item;
// const { Option } = Select;
const { TextArea } = Input;

@connect(({ contract, loading }) => ({
  contract,
  submitting: loading.effects['contract/addERC20ContractMeta'],
}))
@Form.create()
export default class AddContract extends PureComponent {
  componentDidMount = () => {
    // this.props.dispatch({
    //   type: 'coinTask/tokenTypeEnum',
    // });
  };

  handleSubmit = e => {
    e.preventDefault();
    const { dispatch, form } = this.props;

    form.validateFields((err, fieldsValue) => {
      // console.log(fieldsValue)
      if (err) return;
      const newParam = fieldsValue;
      Object.keys(newParam).forEach(item => {
        if (newParam[item] === '') {
          delete newParam[item];
        } else if (item === 'decimal') {
          newParam[item] = +newParam[item];
        }
      });
      const newFieldsValue = { ...newParam };
      dispatch({
        type: 'contract/addERC20ContractMeta',
        params: newFieldsValue,
        callback: () => {
          console.log('success');
          message.success('添加合约成功');
        },
      });
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
      <PageHeaderLayout title="添加合约">
        <Card bordered={false}>
          <Form onSubmit={this.handleSubmit} style={{ marginTop: 8 }}>
            <FormItem {...formItemLayout} label="合约名称">
              {getFieldDecorator('name', {
                validateFirst: true,
                rules: [
                  {
                    whitespace: true,
                    required: true,
                    message: '合约名称为必填项',
                  },
                ],
              })(<Input style={{ width: '100%' }} placeholder="请输入合约名称" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="代币缩写">
              {getFieldDecorator('symbol', {
                validateFirst: true,
                rules: [
                  {
                    whitespace: true,
                    required: true,
                    message: '代币缩写为必填项',
                  },
                ],
              })(<Input style={{ width: '100%' }} placeholder="请输入代币缩写" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="代币精度">
              {getFieldDecorator('decimal', {
                validateFirst: true,
                rules: [
                  {
                    whitespace: true,
                    required: true,
                    message: '代币精度为必填项',
                  },
                ],
              })(<Input style={{ width: '100%' }} placeholder="请输入代币精度" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="合约codes">
              {getFieldDecorator('codes', {
                validateFirst: true,
                rules: [
                  {
                    whitespace: true,
                    required: true,
                    message: '合约codes为必填项',
                  },
                ],
              })(
                <TextArea autosize={{ minRows: 10, maxRows: 20 }} placeholder="请输入合约codes" />
              )}
            </FormItem>
            <FormItem {...formItemLayout} label="合约abis">
              {getFieldDecorator('abis', {
                validateFirst: true,
                rules: [
                  {
                    whitespace: true,
                    required: true,
                    message: '合约abis为必填项',
                  },
                ],
              })(<TextArea autosize={{ minRows: 10, maxRows: 20 }} placeholder="请输入合约abis" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="合约部署地址">
              {getFieldDecorator('address', {
                validateFirst: true,
                rules: [
                  {
                    whitespace: true,
                    required: true,
                    message: '合约部署地址为必填项',
                  },
                ],
              })(<Input style={{ width: '100%' }} placeholder="请输入合约部署地址" />)}
            </FormItem>
            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              <Button type="primary" htmlType="submit" loading={submitting}>
                提交
              </Button>
            </FormItem>
          </Form>
        </Card>
      </PageHeaderLayout>
    );
  }
}
