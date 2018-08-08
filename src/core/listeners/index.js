import { getAllTokenContracts } from '../../core/scenes/contract'

import establishEthListener from './eth'
import establishContractListener from './contract'
import establishTransactionListener from './transaction'

// 监听所有已存在的代币合约的转账事件
getAllTokenContracts()
  .then(res => res.map(({ name }) => name))
  .then((tokenContractNames) => {
    tokenContractNames.forEach(establishContractListener)
  })

establishEthListener()

establishTransactionListener()
