import React, { PureComponent } from 'react';
import { connect } from 'dva';
import {
  Form,
  Input,
  // DatePicker,
  Button,
  Card,
  Modal,
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
const FormItem = Form.Item;
const { TabPane } = Tabs;

@connect(({ loading }) => ({
  submittingWrite: loading.effects['contract/writeContractMethod'],
}))
export default class CreateContract extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      contractName: JSON.parse(props.match.params.params).contractName,
      abis: JSON.parse(JSON.parse(props.match.params.params).abis),
      writeAbisArr: [],
      methodName: '',
      tabIndex: 1,
    };
  }

  componentDidMount = () => {
    const writeAbisArr = [];
    this.state.abis.forEach(item => {
      if (item.type === 'function' && item.constant === false) {
        /* eslint-disable*/
        class FormBasic extends React.Component {
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
                {item.inputs.map((item, index) => {
                  return (
                    <FormItem {...formItemLayout} label={item.name} key={index}>
                      {getFieldDecorator(item.name, {
                        validateFirst: true,
                        rules: [
                          {
                            whitespace: true,
                            required: true,
                            message: `${item.name}为必填项`,
                          },
                        ],
                      })(<Input style={{ width: '100%' }} placeholder={`请输入${item.name}`} />)}
                    </FormItem>
                  );
                })}
                <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
                  <Button type="primary" htmlType="submit" loading={submitting}>
                    调用
                  </Button>
                </FormItem>
              </Form>
            );
          }
        }
        writeAbisArr.push({ FormBasic, AbisName: item.name });
      }
    });
    this.setState({
      writeAbisArr,
    });
  };

  writeContract = (e, validateFieldsAndScroll) => {
    e.preventDefault();
    validateFieldsAndScroll((err, values) => {
      const paramArrInJson = [];
      if (Object.keys(values).length > 1) {
        Object.keys(values).map((item, index) => {
          if (index > 0) {
            paramArrInJson.push(values[item]);
          }
        });
      }
      if (!err) {
        const newParams = {
          caller: values.address,
          contractName: this.state.contractName,
          methodName: this.state.writeAbisArr[this.state.tabIndex - 1].AbisName,
          paramArrInJson: JSON.stringify(paramArrInJson),
        };
        this.props.dispatch({
          type: 'contract/writeContractMethod',
          params: newParams,
          callback: txid => {
            this.success(txid);
            // message.success(`调用成功！txid为${txid}, 可在etherscan查询详情。`, 0);
          },
        });
      }
    });
  };

  success = txid => {
    Modal.success({
      title: '调用成功',
      content: `txid为${txid}, 可在etherscan查询详情。`,
    });
  };

  render() {
    const { submittingWrite } = this.props;
    return (
      <PageHeaderLayout title="合约方法">
        <Tabs
          onChange={key => {
            this.setState({
              tabIndex: key,
            });
          }}
          defaultActiveKey="1"
          size="large"
          tabBarStyle={{ backgroundColor: '#fff', marginBottom: 0 }}
        >
          {this.state.writeAbisArr.map((item, index) => {
            const FormBasicWraper = Form.create({})(item.FormBasic);
            return (
              <TabPane tab={item.AbisName} key={index + 1}>
                <Card bordered={false}>
                  <FormBasicWraper
                    submitting={submittingWrite}
                    handleSubmit={(e, validateFieldsAndScroll) => {
                      this.writeContract(e, validateFieldsAndScroll);
                    }}
                  />
                </Card>
              </TabPane>
            );
          })}
        </Tabs>
      </PageHeaderLayout>
    );
  }
}
