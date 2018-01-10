import {
  deployOwnerAddr,
  deployOwnerSecret,
} from '../config/const'

import { sendToken } from '../server/utils/coin'

export default (
  fromAddress = deployOwnerAddr,
  password = deployOwnerSecret,
  toAddress,
  amount,
) => {
  if (!toAddress || isNaN(+amount) || +amount <= 0) {
    console.error('toAddress 或 amount 无效！')
    process.exit(-1)
  } else {
    sendToken(fromAddress, password, toAddress, amount)
      .then((res) => {
        console.log('success!')
        process.exit(0)
      })
      .catch((err) => {
        console.error(err)
        process.exit(-1)
      })
  }
}
