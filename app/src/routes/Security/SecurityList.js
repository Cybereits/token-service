import React from 'react';
import QRCode from 'qrcode';
import { connect } from 'dva';
import {
  List,
  Card,
  Switch,
  Modal,
  Form,
  // Row,
  // Col,
  Input,
  // Avatar,
} from 'antd';

import PageHeaderLayout from '../../layouts/PageHeaderLayout';

import styles from './SecurityList.less';

const FormItem = Form.Item;

@connect(({ list, loading }) => ({
  list,
  loading: loading.models.list,
}))
@Form.create()
export default class SecurityList extends React.Component {
  state = { visible: false };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'list/fetch',
      payload: {
        count: 5,
      },
    });
    QRCode.toDataURL(
      'otpauth://totp/control.cybereits.com?secret=KNGVMURJGQZXEL2YLZWHEODNIZ6VG5BPGZVSCRTZLYXSUSRQIBMA'
    )
      .then(url => {
        console.log('debug', url);
      })
      .catch(err => {
        console.log(err);
      });
  }

  showModal = () => {
    this.setState({
      visible: true,
    });
  };
  handleOk = e => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };
  handleCancel = e => {
    console.log(e);
    this.setState({
      visible: false,
    });
  };

  render() {
    const { getFieldDecorator } = this.props.form;
    const { loading } = this.props;

    const list = [
      {
        title: '谷歌身份验证器',
      },
      {
        title: '手机',
      },
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
                      checkedChildren="开启"
                      unCheckedChildren="关闭"
                      defaultChecked
                      onChange={this.showModal}
                    />,
                  ]}
                >
                  <List.Item.Meta
                    title={<a href={item.href}>{item.title}</a>}
                    description="description"
                  />
                </List.Item>
              )}
            />
          </Card>
          <Modal
            title="图形验证码"
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            footer={null}
            bodyStyle={{
              textAlign: 'center',
            }}
          >
            <div className={styles.modalForm}>
              <p>请打开谷歌验证器，扫描二维码进行双向绑定。</p>
              <img
                src="data:image/png;base64,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"
                alt="1"
              />
              <Form layout="inline" onSubmit={this.handleSubmit}>
                <FormItem>
                  {getFieldDecorator('token', {
                    rules: [{ required: true, message: '请输入谷歌验证码' }],
                  })(<Input placeholder="请输入谷歌验证码" />)}
                </FormItem>
              </Form>
            </div>
          </Modal>
        </div>
      </PageHeaderLayout>
    );
  }
}
