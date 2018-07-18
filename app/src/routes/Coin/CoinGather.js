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

/* eslint-disable*/
class GatherForm extends React.Component {
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
          <FormItem {...formItemLayout} label="出账地址">
            {getFieldDecorator('fromAddresses', {
              initialValue: textAddressList,
              rules: [
                {
                  whitespace: true,
                  required: true,
                  message: '出账地址为必填项',
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
          <FormItem {...formItemLayout} label="归集地址">
            {getFieldDecorator('gatherAddress', {
              validateFirst: true,
              rules: [
                {
                  whitespace: true,
                  required: true,
                  message: '归集地址为必填项',
                },
              ],
            })(<Input style={{ width: '100%' }} placeholder="请输入归集地址" />)}
          </FormItem>
          {/* <FormItem {...formItemLayout} label="备注">
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
          </FormItem> */}
          <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
            <Button type="primary" htmlType="submit" loading={submitting}>
              提交
            </Button>
          </FormItem>
        </Form>
      </div>
    );
  }
}

const GatherForm_ = Form.create({})(GatherForm);

@connect(({ coinTask, loading }) => ({
  coinTask,
  submitting: loading.effects['coinTask/gatherAllTokens'],
}))
export default class CoinGather extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount = () => {
    this.props.dispatch({
      type: 'coinTask/tokenTypeEnum',
    });
  };

  gather = (e, validateFieldsAndScroll) => {
    e.preventDefault();
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        const newParams = {
          fromAddresses: [],
          gatherAddress: values.gatherAddress,
          tokenType: values.tokenType,
        };
        encodeURIComponent(values.fromAddresses)
          .split('%0A')
          .map(item => {
            newParams.fromAddresses.push(item);
          });
        this.props.dispatch({
          type: 'coinTask/gatherAllTokens',
          params: newParams,
          callback: response => {
            if (response) {
              message.success('创建归集任务成功！');
              this.props.dispatch(
                routerRedux.push({
                  pathname: '/coin/coin-overview/taskList',
                })
              );
            }
          },
        });
      }
    });
  };

  render() {
    const { submitting, coinTask: { tokenTypeEnum } } = this.props;

    return (
      <PageHeaderLayout title="创建转账任务">
        <Card bordered={false}>
          <GatherForm_
            submitting={submitting}
            handleSubmit={(e, validateFieldsAndScroll) => {
              this.gather(e, validateFieldsAndScroll);
            }}
            textAddressList={this.state.textAddressList}
            tokenTypeEnum={tokenTypeEnum}
          />
        </Card>
      </PageHeaderLayout>
    );
  }
}
