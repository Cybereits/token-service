import React from 'react';
import { connect } from 'dva';
import styles from './CoinOverView.less';

@connect(({ global }) => ({
  global,
}))
class CoinOverView extends React.Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'global/updateServerState',
    });
    this.releaseItv();
    this.stateItv = setInterval(() => {
      this.props.dispatch({
        type: 'global/updateServerState',
      });
    }, 1000 * 10);
  }

  componentWillUnmount() {
    this.releaseItv();
  }

  releaseItv() {
    clearInterval(this.stateItv);
  }

  render() {
    const { global: { tokenBalanceOverviewList, currentBlockHeight, gasPrice } } = this.props;
    return (
      <div className={styles.container}>
        <div className={styles.statusContainer}>
          <div>当前区块高度：{currentBlockHeight}</div>
          <div>
            当前油价：{(+gasPrice).toFixed(10)} ({+gasPrice * 10 ** 8} GWei)
          </div>
        </div>
        <div className={styles.balanceContainer}>
          {tokenBalanceOverviewList.map((item, index) => {
            return (
              /*eslint-disable*/
              <div key={index} className={styles.balanceCell}>
                {item.name} {item.value}
              </div>
            );
          })}
        </div>
      </div>
    );
  }
}

export default CoinOverView;
