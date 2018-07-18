import React from 'react';
import styles from './FlexHeader.less';

class FlexHeader extends React.Component {
  render() {
    const { collapsed } = this.props;
    return (
      <div className={styles.container} style={{ left: !collapsed ? '256px' : '80px' }}>
        <div>
          <div className={styles.name}>ETH</div>
          <div className={styles.value}>10000</div>
        </div>
        <div>
          <div className={styles.name}>ETH</div>
          <div className={styles.value}>10000</div>
        </div>
        <div>
          <div className={styles.name}>ETH</div>
          <div className={styles.value}>10000</div>
        </div>
      </div>
    );
  }
}

export default FlexHeader;
