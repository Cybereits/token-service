import abi from 'ethereumjs-abi'
// import BN from 'bn.js'
// var abi = require('ethereumjs-abi')

import {
  tokenSupply,
  contractDecimals,
  teamLockPercent,
  teamAddr01,
  teamAddr02,
  teamAddr03,
  teamAddr04,
  teamAddr05,
  teamAddr06,
} from '../config/const'

// export default () => console.log(
//   abi.soliditySHA3(
//     [
//       'uint256',
//       'uint256',
//       'uint256',
//       'address',
//       'address',
//       'address',
//       'address',
//       'address',
//       'address',
//     ],
//     [
//       tokenSupply,
//       contractDecimals,
//       teamLockPercent,
//       teamAddr01,
//       teamAddr02,
//       teamAddr03,
//       teamAddr04,
//       teamAddr05,
//       teamAddr06,
//     ]
//   ).toString('hex')
// )

export default () => {
  let result = abi.rawEncode([
    'uint256',
    'uint256',
    'uint256',
    'address',
    'address',
    'address',
    'address',
    'address',
    'address',
  ],
    [
      tokenSupply,
      contractDecimals,
      teamLockPercent,
      teamAddr01,
      teamAddr02,
      teamAddr03,
      teamAddr04,
      teamAddr05,
      teamAddr06,
    ],
  )

  console.log(result.toString('hex'))
}

// var encoded = abi.encode(tokenContractAbi, 'CybereitsToken(uint256 lockAmount, 
// uint256 total,
// uint256 _decimals,
// uint256 _teamLockPercent,
// address _teamAddr1,
// address _teamAddr2,
// address _teamAddr3,
// address _teamAddr4,
// address _teamAddr5,
// address _teamAddr6'
// , [
//   tokenSupply,
//   contractDecimals,
//   teamLockPercent,
//   teamAddr01,
//   teamAddr02,
//   teamAddr03,
//   teamAddr04,
//   teamAddr05,
//   teamAddr06,
// ])
