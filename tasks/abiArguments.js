import abi from 'ethereumjs-abi'

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
