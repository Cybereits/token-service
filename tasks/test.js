import { getERC20TokenAccountBalance } from '../apis/etherscanApis'

export default () => {
  getERC20TokenAccountBalance()
    .then((res) => {
      console.log(res)
    })
}
