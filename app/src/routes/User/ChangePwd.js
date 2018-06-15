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
// const { TextArea } = Input;

@connect(({ user, loading }) => ({
  user,
  submitting: loading.effects['user/changePwd'],
}))
@Form.create()
export default class ChangePwd extends PureComponent {
  // componentDidMount = () => {
  //   this.props.dispatch({
  //     type: 'coinTask/tokenTypeEnum',
  //   });
  // };

  handleSubmit = e => {
    e.preventDefault();
    // console.log(this.props)
    const { dispatch, form } = this.props;

    form.validateFields((err, fields) => {
      console.log(fields);
      if (err) return;
      // this.setState({
      //   formValues: fieldsValue,
      // });
      // const newParam = fieldsValue;
      // Object.keys(newParam).forEach(item => {
      //   console.log(newParam[item], item);
      //   if (newParam[item] === '') {
      //     delete newParam[item];
      //   } else if (item === 'tokenType' && newParam[item] === undefined) {
      //     newParam[item] = 'Enum(eth)';
      //   }
      // });
      const newFieldsValue = { ...fields };
      dispatch({
        type: 'user/changePwd',
        params: newFieldsValue,
        callback: () => {
          console.log('success');
          message.success('修改密码成功');
          form.resetFields();
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
      <PageHeaderLayout title="修改密码">
        <Card bordered={false}>
          <Form onSubmit={this.handleSubmit} style={{ marginTop: 8 }}>
            <FormItem {...formItemLayout} label="原密码">
              {getFieldDecorator('originPassword', {
                validateFirst: true,
                rules: [
                  {
                    whitespace: true,
                    required: true,
                    message: '原密码为必填项',
                  },
                ],
              })(<Input type="password" style={{ width: '100%' }} placeholder="请输入原密码" />)}
            </FormItem>
            <FormItem {...formItemLayout} label="新密码">
              {getFieldDecorator('newPassword', {
                validateFirst: true,
                rules: [
                  {
                    whitespace: true,
                    required: true,
                    message: '新密码为必填项',
                  },
                ],
              })(<Input type="password" style={{ width: '100%' }} placeholder="请输入新密码" />)}
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
              })(<Input type="password" style={{ width: '100%' }} placeholder="请输入确认密码" />)}
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
            </FormItem>
          </Form>
        </Card>
      </PageHeaderLayout>
    );
  }
}
