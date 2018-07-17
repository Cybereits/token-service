import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form,
  Input,
  // DatePicker,
  Select,
  Button,
  Card,
  message,
  Tabs,
  // InputNumber,
  // Radio,
  // Icon,
  // Tooltip,
} from 'antd';
import PageHeaderLayout from '../../layouts/PageHeaderLayout';
// import styles from './CoinSend.less';

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
class FormCoin extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { submitting, handleSubmit } = this.props;
    const { getFieldDecorator, validateFieldsAndScroll } = this.props.form;
    return (
      <Form
        onSubmit={e => {
          handleSubmit(e, validateFieldsAndScroll);
        }}
        style={{ marginTop: 8 }}
      >
        <FormItem {...formItemLayout} label="钱包地址">
          {getFieldDecorator('address', {
            validateFirst: true,
            rules: [
              {
                whitespace: true,
                required: true,
                message: '钱包地址为必填项',
              },
            ],
          })(<Input style={{ width: '100%' }} placeholder="请输入钱包地址" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="代币总量">
          {getFieldDecorator('tokenSupply', {
            validateFirst: true,
            rules: [
              {
                whitespace: true,
                required: true,
                message: '代币总量为必填项',
              },
            ],
          })(<Input style={{ width: '100%' }} placeholder="请输入代币总量" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="合约精度">
          {getFieldDecorator('contractDecimals', {
            validateFirst: true,
            rules: [
              {
                whitespace: true,
                required: true,
                message: '合约精度为必填项',
              },
            ],
          })(<Input style={{ width: '100%' }} placeholder="请输入合约精度" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="团队锁仓百分比">
          {getFieldDecorator('lockPercent', {
            validateFirst: true,
            rules: [
              {
                whitespace: true,
                required: true,
                message: '团队锁仓百分比为必填项',
              },
            ],
          })(<Input style={{ width: '100%' }} placeholder="请输入团队锁仓百分比" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="锁仓地址一">
          {getFieldDecorator('lockAddresses1', {
            validateFirst: true,
            rules: [
              {
                whitespace: true,
                required: true,
                message: '锁仓地址为必填项',
              },
            ],
          })(<Input style={{ width: '100%' }} placeholder="请输入锁仓地址" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="锁仓地址二">
          {getFieldDecorator('lockAddresses2', {
            validateFirst: true,
            rules: [
              {
                whitespace: true,
                required: true,
                message: '锁仓地址为必填项',
              },
            ],
          })(<Input style={{ width: '100%' }} placeholder="请输入锁仓地址" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="锁仓地址三">
          {getFieldDecorator('lockAddresses3', {
            validateFirst: true,
            rules: [
              {
                whitespace: true,
                required: true,
                message: '锁仓地址为必填项',
              },
            ],
          })(<Input style={{ width: '100%' }} placeholder="请输入锁仓地址" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="锁仓地址四">
          {getFieldDecorator('lockAddresses4', {
            validateFirst: true,
            rules: [
              {
                whitespace: true,
                required: true,
                message: '锁仓地址为必填项',
              },
            ],
          })(<Input style={{ width: '100%' }} placeholder="请输入锁仓地址" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="锁仓地址五">
          {getFieldDecorator('lockAddresses5', {
            validateFirst: true,
            rules: [
              {
                whitespace: true,
                required: true,
                message: '锁仓地址为必填项',
              },
            ],
          })(<Input style={{ width: '100%' }} placeholder="请输入锁仓地址" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="锁仓地址六">
          {getFieldDecorator('lockAddresses6', {
            validateFirst: true,
            rules: [
              {
                whitespace: true,
                required: true,
                message: '锁仓地址为必填项',
              },
            ],
          })(<Input style={{ width: '100%' }} placeholder="请输入锁仓地址" />)}
        </FormItem>
        <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
          <Button type="primary" htmlType="submit" loading={submitting}>
            提交
          </Button>
        </FormItem>
      </Form>
    );
  }
}
/* eslint-disable*/
class FomrKYC extends React.Component {
  render() {
    const { submitting, handleSubmit } = this.props;
    const { getFieldDecorator, validateFieldsAndScroll } = this.props.form;
    return (
      <Form
        onSubmit={e => {
          handleSubmit(e, validateFieldsAndScroll);
        }}
        style={{ marginTop: 8 }}
      >
        <FormItem {...formItemLayout} label="钱包地址">
          {getFieldDecorator('address', {
            validateFirst: true,
            rules: [
              {
                whitespace: true,
                required: true,
                message: '钱包地址为必填项',
              },
            ],
          })(<Input style={{ width: '100%' }} placeholder="请输入钱包地址" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="合约名称">
          {getFieldDecorator('contractName', {
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
        <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
          <Button type="primary" htmlType="submit" loading={submitting}>
            提交
          </Button>
        </FormItem>
      </Form>
    );
  }
}
/* eslint-disable*/
class FomrAsset extends React.Component {
  render() {
    const { submitting, handleSubmit } = this.props;
    const { getFieldDecorator, validateFieldsAndScroll } = this.props.form;
    return (
      <Form
        onSubmit={e => {
          handleSubmit(e, validateFieldsAndScroll);
        }}
        style={{ marginTop: 8 }}
      >
        <FormItem {...formItemLayout} label="钱包地址">
          {getFieldDecorator('address', {
            validateFirst: true,
            rules: [
              {
                whitespace: true,
                required: true,
                message: '钱包地址为必填项',
              },
            ],
          })(<Input style={{ width: '100%' }} placeholder="请输入钱包地址" />)}
        </FormItem>
        {/* <FormItem {...formItemLayout} label="秘钥">
          {getFieldDecorator('secret', {
            validateFirst: true,
            rules: [
              {
                whitespace: true,
                required: false,
              },
            ],
          })(<Input type="password" style={{ width: '100%' }} placeholder="请输入秘钥" />)}
        </FormItem> */}
        <FormItem {...formItemLayout} label="代币总量">
          {getFieldDecorator('tokenSupply', {
            validateFirst: true,
            rules: [
              {
                whitespace: true,
                required: true,
                message: '代币总量为必填项',
              },
            ],
          })(<Input style={{ width: '100%' }} placeholder="请输入代币总量" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="代币缩写">
          {getFieldDecorator('tokenSymbol', {
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
        <FormItem {...formItemLayout} label="合约名称">
          {getFieldDecorator('contractName', {
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
        <FormItem {...formItemLayout} label="合约精度">
          {getFieldDecorator('contractDecimals', {
            validateFirst: true,
            rules: [
              {
                whitespace: true,
                required: true,
                message: '合约精度为必填项',
              },
            ],
          })(<Input style={{ width: '100%' }} placeholder="请输入合约精度" />)}
        </FormItem>
        <FormItem {...formItemLayout} label="kyc地址">
          {getFieldDecorator('kycAddress', {
            validateFirst: true,
            rules: [
              {
                whitespace: true,
                required: true,
                message: 'kyc合约地址为必填项',
              },
            ],
          })(<Input style={{ width: '100%' }} placeholder="请输入kyc合约地址" />)}
        </FormItem>
        <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
          <Button type="primary" htmlType="submit" loading={submitting}>
            提交
          </Button>
        </FormItem>
      </Form>
    );
  }
}

const FormItem = Form.Item;
const { Option } = Select;
const { TextArea } = Input;
const { TabPane } = Tabs;

const FomrCoin_ = Form.create({})(FormCoin);
const FomrKYC_ = Form.create({})(FomrKYC);
const FomrAsset_ = Form.create({})(FomrAsset);

@connect(({ contract, loading }) => ({
  submittingCoin: loading.effects['contract/deployCREContract'],
  submittingKyc: loading.effects['contract/deployKycContract'],
  submittingAsset: loading.effects['contract/deployAssetContract'],
}))
export default class CreateContract extends PureComponent {
  coinHandleSubmit = (e, validateFieldsAndScroll) => {
    e.preventDefault();
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        const newParams = {
          ...values,
          lockAddresses: [
            values.lockAddresses1,
            values.lockAddresses2,
            values.lockAddresses3,
            values.lockAddresses4,
            values.lockAddresses5,
            values.lockAddresses6,
          ],
        };
        Object.keys(newParams).forEach(item => {
          if (item === 'tokenSupply') {
            newParams[item] = +newParams[item];
          } else if (item === 'contractDecimals') {
            newParams[item] = +newParams[item];
          } else if (item === 'lockPercent') {
            newParams[item] = +newParams[item];
          }
        });
        this.props.dispatch({
          type: 'contract/deployCREContract',
          params: newParams,
          callback: () => {
            message.success('部署代币合约成功！');
          },
        });
      }
    });
  };
  kycHandleSubmit = (e, validateFieldsAndScroll) => {
    e.preventDefault();
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        const newParams = { ...values };
        Object.keys(newParams).forEach(item => {
          if (item === 'tokenSupply') {
            newParams[item] = +newParams[item];
          } else if (item === 'contractDecimals') {
            newParams[item] = +newParams[item];
          }
        });
        this.props.dispatch({
          type: 'contract/deployKycContract',
          params: newParams,
          callback: () => {
            message.success('部署kyc合约成功！');
          },
        });
      }
    });
  };
  assetHandleSubmit = (e, validateFieldsAndScroll) => {
    e.preventDefault();
    validateFieldsAndScroll((err, values) => {
      if (!err) {
        const newParams = { ...values };
        Object.keys(newParams).forEach(item => {
          if (item === 'tokenSupply') {
            newParams[item] = +newParams[item];
          } else if (item === 'contractDecimals') {
            newParams[item] = +newParams[item];
          }
        });
        this.props.dispatch({
          type: 'contract/deployAssetContract',
          params: newParams,
          callback: () => {
            message.success('部署资产合约成功！');
          },
        });
      }
    });
  };
  render() {
    const { submittingCoin, submittingKyc, submittingAsset } = this.props;
    return (
      <PageHeaderLayout title="创建转账任务">
        <Tabs
          defaultActiveKey="1"
          size="large"
          tabBarStyle={{ backgroundColor: '#fff', marginBottom: 0 }}
        >
          <TabPane tab="代币锁仓合约" key="1">
            <Card bordered={false}>
              <FomrCoin_
                submitting={submittingCoin}
                handleSubmit={(e, validateFieldsAndScroll) => {
                  this.coinHandleSubmit(e, validateFieldsAndScroll);
                }}
              />
            </Card>
          </TabPane>
          <TabPane tab="KYC合约" key="2">
            <Card bordered={false}>
              <FomrKYC_
                submitting={submittingKyc}
                handleSubmit={(e, validateFieldsAndScroll) => {
                  this.kycHandleSubmit(e, validateFieldsAndScroll);
                }}
              />
            </Card>
          </TabPane>
          <TabPane tab="资产合约" key="3">
            <Card bordered={false}>
              <FomrAsset_
                submitting={submittingAsset}
                handleSubmit={(e, validateFieldsAndScroll) => {
                  this.assetHandleSubmit(e, validateFieldsAndScroll);
                }}
              />
            </Card>
          </TabPane>
        </Tabs>
      </PageHeaderLayout>
    );
  }
}
