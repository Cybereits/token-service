import React, { Component } from 'react';
import { connect } from 'dva';
import { routerRedux } from 'dva/router';
import {
  // Checkbox,
  Alert,
  message,
  Icon,
} from 'antd';
import Login from 'components/Login';
import styles from './Login.less';

const {
  //  Tab,
  UserName,
  Password,
  // Mobile,
  // Captcha,
  Submit,
} = Login;

@connect(({ login, loading }) => ({
  login,
  submitting: loading.effects['login/login'],
}))
export default class ForgetPwd extends Component {
  state = {
    type: 'account',
    // autoLogin: true,
  };

  onTabChange = type => {
    this.setState({ type });
  };

  handleSubmit = (err, values) => {
    if (!err) {
      this.props.dispatch({
        type: 'login/resetPwd',
        params: values,
        callback: () => {
          message.success('找回密码成功,请登录。');
          this.props.dispatch(routerRedux.push('/entry/login'));
        },
      });
    }
  };

  // changeAutoLogin = e => {
  //   this.setState({
  //     autoLogin: e.target.checked,
  //   });
  // };

  renderMessage = content => {
    return <Alert style={{ marginBottom: 24 }} message={content} type="error" showIcon />;
  };

  render() {
    const { login, submitting } = this.props;
    const { type } = this.state;
    return (
      <div className={styles.main}>
        <Login defaultActiveKey={type} onTabChange={this.onTabChange} onSubmit={this.handleSubmit}>
          <div style={{ height: '28px' }} />
          {/* <Tab key="account" tab="账户密码登录"> */}
          {login.status === 'error' &&
            login.type === 'account' &&
            !login.submitting &&
            this.renderMessage('账户或密码错误')}
          <UserName name="username" placeholder="请输入用户名" />
          <Password name="newPassword" placeholder="请输入密码" />
          <Password name="validPassword" placeholder="请再次输入密码" />
          <UserName
            prefix={<Icon type="safety" style={{ color: 'rgba(0,0,0,.25)' }} />}
            name="token"
            rules={[{ whitespace: true, required: false }]}
            placeholder="请输入谷歌验证码"
          />
          {/* </Tab> */}
          {/* <Tab key="mobile" tab="手机号登录">
            {login.status === 'error' &&
              login.type === 'mobile' &&
              !login.submitting &&
              this.renderMessage('验证码错误')}
            <Mobile name="mobile" />
            <Captcha name="captcha" />
          </Tab> */}
          {/* <div>
            <Checkbox checked={this.state.autoLogin} onChange={this.changeAutoLogin}>
              自动登录
            </Checkbox>
            <a style={{ float: 'right' }} href="">
              忘记密码
            </a>
          </div> */}
          <Submit loading={submitting}>重置密码</Submit>
          <div className={styles.other}>
            {/* 其他登录方式
            <Icon className={styles.icon} type="alipay-circle" />
            <Icon className={styles.icon} type="taobao-circle" />
            <Icon className={styles.icon} type="weibo-circle" /> */}
            {/* <Link className={styles.register} to="/user/register">
              注册账户
            </Link> */}
          </div>
        </Login>
      </div>
    );
  }
}
