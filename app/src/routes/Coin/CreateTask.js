import React, { PureComponent } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import {
  Form,
  Input,
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

@connect(({ coinTask, loading }) => ({
  coinTask,
  submitting: loading.effects['coinTask/createBatchTransactions'],
}))
@Form.create()
export default class CreateTask extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
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

  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const newValues = { ...values };
        newValues.transactions = encodeURIComponent(newValues.transactions);
        this.props.dispatch({
          type: 'coinTask/createBatchTransactions',
          params: newValues,
          callback: () => {
            console.log('success');
            message.success('创建转账任务成功！');
            this.props.dispatch(
              routerRedux.push({
                pathname: '/coin/coin-overview/taskList',
              })
            );
          },
        });
      }
    });
  };
  render() {
    const { submitting, coinTask: { tokenTypeEnum } } = this.props;
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
      <PageHeaderLayout title="创建转账任务">
        <Card bordered={false}>
          <Form onSubmit={this.handleSubmit} style={{ marginTop: 8 }}>
            <FormItem {...formItemLayout} label="transactions">
              {getFieldDecorator('transactions', {
                initialValue: this.state.textAddressList,
                rules: [
                  {
                    whitespace: true,
                    required: true,
                    message: 'transactions为必填项',
                  },
                ],
              })(
                <TextArea
                  autosize={{ minRows: 10, maxRows: 20 }}
                  placeholder="请输入transactions"
                />
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
