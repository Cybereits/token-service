import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { Route, Redirect, Switch } from 'dva/router';
import {
  Row,
  Col,
  // Icon,
  Card,
  Steps,
} from 'antd';
import { Pie } from 'components/Charts';
import { getRoutes } from '../../utils/utils';
import NotFound from '../Exception/404';
import styles from './CoinOverview.less';

const { Step } = Steps;

@connect(({ coin, loading }) => ({
  coin,
  loading: loading.models.coin,
}))
export default class Analysis extends Component {
  state = {};

  componentDidMount() {
    this.props.dispatch({
      type: 'coin/sendCoinOverview',
    });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'coin/clear',
    });
  }

  getCurrentStep() {
    const { location } = this.props;
    const { pathname } = location;
    const pathList = pathname.split('/');
    if (pathList.indexOf('taskList') !== -1) {
      return 0;
    } else if (pathList.indexOf('taskDetail') !== -1) {
      return 1;
    } else {
      return 0;
    }
  }

  render() {
    const { coin: { sendCoinOverviewData, coinTotal }, loading, match, routerData } = this.props;
    return (
      <Fragment>
        <Row gutter={24}>
          <Col xl={24} lg={24} md={24} sm={24} xs={24}>
            <Card
              loading={loading}
              className={styles.salesCard}
              bordered={false}
              bodyStyle={{ padding: 24 }}
              style={{ marginTop: 24, minHeight: 509 }}
            >
              <h4 style={{ marginTop: 8, marginBottom: 32 }}>转账交易概览</h4>
              <Pie
                hasLegend
                subTitle="转账交易"
                total={() => (
                  <span
                    /* eslint-disable */
                    dangerouslySetInnerHTML={{
                      __html: coinTotal,
                    }}
                  />
                )}
                data={sendCoinOverviewData}
                height={248}
                lineWidth={4}
              />
            </Card>
          </Col>
          <Col xl={24} lg={24} md={24} sm={24} xs={24}>
            <Card
              loading={loading}
              className={styles.salesCard}
              bordered={false}
              bodyStyle={{ padding: 24 }}
              style={{ marginTop: 24, minHeight: 509 }}
            >
              <Fragment>
                <Steps current={this.getCurrentStep()} className={styles.steps}>
                  <Step title="任务列表" />
                  <Step title="任务详情" />
                </Steps>
                <Switch>
                  {getRoutes(match.path, routerData).map(item => {
                    return (
                      <Route
                        key={item.key}
                        path={item.path}
                        component={item.component}
                        exact={item.exact}
                      />
                    );
                  })}
                  <Redirect exact from="/coin/coin-overview" to="/coin/coin-overview/taskList" />
                  <Route render={NotFound} />
                </Switch>
              </Fragment>
            </Card>
          </Col>
        </Row>
      </Fragment>
    );
  }
}
