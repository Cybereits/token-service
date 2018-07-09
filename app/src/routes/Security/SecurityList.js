import React from 'react';
import { connect } from 'dva';
import {
  List,
  Card,
  Switch,
  Modal,
  Form,
  message,
  // Row,
  // Col,
  Input,
  // Avatar,
} from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './SecurityList.less';

const FormItem = Form.Item;

@connect(({ security, loading }) => ({
  security,
  loading: loading.effects['security/getAdminInfo'],
}))
@Form.create()
export default class SecurityList extends React.Component {
  state = {
    visible: false,
    tokenConfirmLoading: false,
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'security/getAdminInfo',
      callback: getAdminInfo => {
        this.setState({
          bindMobile: getAdminInfo.bindMobile,
          bindTwoFactorAuth: getAdminInfo.bindTwoFactorAuth,
        });
        if (!getAdminInfo.bindTwoFactorAuth) {
          dispatch({
            type: 'security/getTwoFactorAuthUrl',
          });
        }
      },
    });
  }

  bindTwoFactorAuth = value => {
    const { dispatch, form } = this.props;
    const { setFields, resetFields } = form;
    // const { validateFieldsAndScroll, setFields } = form;
    if (value !== undefined) {
      this.setState({
        tokenConfirmLoading: true,
      });
      dispatch({
        type: 'security/bindTwoFactorAuth',
        params: {
          token: value,
        },
        callback: response => {
          this.setState({
            tokenConfirmLoading: false,
          });
          if (response) {
            resetFields('token');
            this.setState({
              visible: !response,
            });
            message.success('绑定成功！');
          }
        },
      });
    } else {
      setFields({
        token: {
          errors: [
            {
              message: '请输入谷歌验证码',
            },
          ],
        },
      });
    }
  };

  switchCb = (key, status) => {
    this.setState(
      {
        visible: true,
        bindTwoFactorAuth: key === 'token' ? !status : this.state.bindTwoFactorAuth,
        bindMobile: key === 'phone' ? !status : this.state.bindMobile,
      },
      () => {
        setTimeout(() => {
          this.input.focus();
        });
      }
    );
  };
  // handleOk = e => {
  //   console.log(e);
  //   this.setState({
  //     visible: false,
  //   });
  // };
  handleCancel = e => {
    const { resetFields } = this.props.form;
    resetFields('token');
    console.log(e);
    this.setState({
      visible: false,
      bindTwoFactorAuth: !this.state.bindTwoFactorAuth,
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { loading, security: { getTwoFactorAuthUrl } } = this.props;
    const { bindTwoFactorAuth, tokenConfirmLoading } = this.state;
    const list = [
      {
        title: '谷歌身份验证器',
        status: bindTwoFactorAuth,
        key: 'token',
      },
      // {
      //   title: '手机',
      //   status: bindMobile,
      //   key: 'phone',
      // },
    ];

    return (
      <PageHeaderLayout title="安全中心">
        <div className={styles.standardList}>
          <Card className={styles.listCard} bordered={false} style={{ marginTop: 24 }}>
            <List
              size="large"
              rowKey="id"
              loading={loading}
              dataSource={list}
              renderItem={item => (
                <List.Item
                  actions={[
                    <Switch
                      disabled={item.status}
                      checked={item.status}
                      checkedChildren="开启"
                      unCheckedChildren="关闭"
                      onChange={() => {
                        this.switchCb(item.key, item.status);
                      }}
                      loading={loading}
                    />,
                  ]}
                >
                  <List.Item.Meta title={<a href={item.href}>{item.title}</a>} />
                </List.Item>
              )}
            />
          </Card>
          <Modal
            title="二维码"
            confirmLoading={tokenConfirmLoading}
            visible={this.state.visible}
            onOk={() => {
              this.bindTwoFactorAuth(this.props.form.getFieldsValue().token);
            }}
            onCancel={this.handleCancel}
            bodyStyle={{
              textAlign: 'center',
            }}
          >
            <div className={styles.modalForm}>
              <p>请打开谷歌验证器，扫描二维码进行双向绑定。</p>
              <img src={getTwoFactorAuthUrl} alt="1" />
              <Form layout="inline" onSubmit={this.handleSubmit}>
                <FormItem>
                  {getFieldDecorator('token', {
                    rules: [{ required: true, message: '请输入谷歌验证码' }],
                  })(
                    <Input
                      maxLength={6}
                      onChange={() => {
                        setTimeout(() => {
                          if (this.props.form.getFieldsValue().token.length === 6) {
                            this.bindTwoFactorAuth(this.props.form.getFieldsValue().token);
                          }
                        }, 0);
                      }}
                      ref={ref => {
                        this.input = ref;
                      }}
                      placeholder="请输入谷歌验证码"
                    />
                  )}
                </FormItem>
              </Form>
            </div>
          </Modal>
        </div>
      </PageHeaderLayout>
    );
  }
}
