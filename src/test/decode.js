import { connect } from '../framework/web3'

export default () => {

  let str = '0xa9059cbb0000000000000000000000002abe40823174787749628be669d9d9ae4da8443400000000000000000000000000000000000000000000025a5419af66253c0000'
  let t = connect.eth.abi.decodeParameters(['address', 'address', 'uint256'], str)
  console.log(t)
}
