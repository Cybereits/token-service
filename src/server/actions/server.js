import { serverStatesResult } from '../types/plainTypes'
import getConnection from '../../framework/web3'

export const serverStates = {
  type: serverStatesResult,
  description: '代币类型枚举类型',
  async resolve() {
    let conn = getConnection()
    // 当前区块高度
    let currentBlockHeight = await conn.eth.getBlockNumber()
    // 当前油价
    let gasPrice = await conn.eth.getGasPrice()

    return {
      currentBlockHeight,
      gasPrice: conn.eth.extend.utils.fromWei(gasPrice).toString(10),
    }
  },
}
