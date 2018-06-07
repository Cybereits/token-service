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
  handleSubmit = e => {
    e.preventDefault();
    this.props.form.validateFieldsAndScroll((err, values) => {
      console.log(err, values);
      if (!err) {
        this.props.dispatch({
          type: 'coinTask/createBatchTransactions',
          params: values,
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
      <PageHeaderLayout title="创建转账任务">
        <Card bordered={false}>
          <Form onSubmit={this.handleSubmit} style={{ marginTop: 8 }}>
            <FormItem {...formItemLayout} label="transactions">
              {getFieldDecorator('transactions', {
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
                  <Option value="Enum(cre)">cre</Option>
                  <Option value="Enum(eth)">eth</Option>
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
            {/* <FormItem {...formItemLayout} label="目标描述">
              {getFieldDecorator('goal', {
                rules: [
                  {
                    required: true,
                    message: '请输入目标描述',
                  },
                ],
              })(
                <TextArea
                  style={{ minHeight: 32 }}
                  placeholder="请输入你的阶段性工作目标"
                  rows={4}
                />
                )}
            </FormItem>
            <FormItem {...formItemLayout} label="衡量标准">
              {getFieldDecorator('standard', {
                rules: [
                  {
                    required: true,
                    message: '请输入衡量标准',
                  },
                ],
              })(<TextArea style={{ minHeight: 32 }} placeholder="请输入衡量标准" rows={4} />)}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={
                <span>
                  客户
                  <em className={styles.optional}>
                    （选填）
                    <Tooltip title="目标的服务对象">
                      <Icon type="info-circle-o" style={{ marginRight: 4 }} />
                    </Tooltip>
                  </em>
                </span>
              }
            >
              {getFieldDecorator('client')(
                <Input placeholder="请描述你服务的客户，内部客户直接 @姓名／工号" />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={
                <span>
                  邀评人<em className={styles.optional}>（选填）</em>
                </span>
              }
            >
              {getFieldDecorator('invites')(
                <Input placeholder="请直接 @姓名／工号，最多可邀请 5 人" />
              )}
            </FormItem>
            <FormItem
              {...formItemLayout}
              label={
                <span>
                  权重<em className={styles.optional}>（选填）</em>
                </span>
              }
            >
              {getFieldDecorator('weight')(<InputNumber placeholder="请输入" min={0} max={100} />)}
              <span>%</span>
            </FormItem>
            <FormItem {...formItemLayout} label="目标公开" help="客户、邀评人默认被分享">
              <div>
                {getFieldDecorator('public', {
                  initialValue: '1',
                })(
                  <Radio.Group>
                    <Radio value="1">公开</Radio>
                    <Radio value="2">部分公开</Radio>
                    <Radio value="3">不公开</Radio>
                  </Radio.Group>
                  )}
                <FormItem style={{ marginBottom: 0 }}>
                  {getFieldDecorator('publicUsers')(
                    <Select
                      mode="multiple"
                      placeholder="公开给"
                      style={{
                        margin: '8px 0',
                        display: getFieldValue('public') === '2' ? 'block' : 'none',
                      }}
                    >
                      <Option value="1">同事甲</Option>
                      <Option value="2">同事乙</Option>
                      <Option value="3">同事丙</Option>
                    </Select>
                  )}
                </FormItem>
              </div>
            </FormItem> */}
            <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
              <Button type="primary" htmlType="submit" loading={submitting}>
                提交
              </Button>
              {/* <Button style={{ marginLeft: 8 }}>保存</Button> */}
            </FormItem>
          </Form>
        </Card>
      </PageHeaderLayout>
    );
  }
}
