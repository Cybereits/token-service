import { GraphQLString as str } from 'graphql'
import { exportAccountInfo } from '../../core/scenes/excel'

export const exportAccountBalanceData = {
  type: str,
  description: '导出账户 eth/cre 信息',
  async resolve() {
    return exportAccountInfo()
  },
}
