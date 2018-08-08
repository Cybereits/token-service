import React from 'react';
import { connect } from 'dva';
import styles from './CoinOverView.less';

@connect(({ coin, loading }) => ({
  coin,
  loading: loading.models.coin,
}))
class CoinOverView extends React.Component {
  componentDidMount() {
    this.props.dispatch({
      type: 'coin/tokenBalanceOverview',
    });
    this.itv = setInterval(() => {
      this.props.dispatch({
        type: 'coin/tokenBalanceOverview',
      });
    }, 1000 * 30);
  }

  componentWillUnmount() {
    clearInterval(this.itv);
  }

  render() {
    const { coin: { tokenBalanceOverviewList } } = this.props;
    return (
      <div className={styles.container}>
        {tokenBalanceOverviewList.map((item, index) => {
          return (
            /*eslint-disable*/
            <div key={index}>
              <div className={styles.name}>{item.name}</div>
              <div className={styles.value}>{item.value}</div>
            </div>
          );
        })}
      </div>
    );
  }
}

export default CoinOverView;
