import { etherScanApi, apikey } from '../config/const'
import request from '../framework/request'
import { concatUrl } from './urlHelper'
import contractData from '../contracts/token.json'

export function getTransaction(address) {
  return request.get(concatUrl(etherScanApi, {
    module: 'account',
    action: 'txlist',
    address: address,
    startblock: 0,
    endblock: 99999999,
    page: 1,
    offset: 100,
    sort: 'asc',
    apikey: apikey,
  }))
}

// {
//   "status": "1",
//   "message": "OK",
//   "result": "673457032179599583078378"
// }
export function getBalance(queryAddr) {
  return request.get(concatUrl(etherScanApi, {
    module: 'account',
    action: 'balance',
    tag: 'latest',
    address: queryAddr,
    apikey,
  }))
}

//   {
//     "status": "1",
//     "message": "OK",
//     "result": [
//         {
//             "account": "0xddbd2b932c763ba5b1b7ae3b362eac3e8d40121a",
//             "balance": "40807168564070000000000"
//         },
//         {
//             "account": "0x63a9975ba31b0b9626b34300f7f627147df1f526",
//             "balance": "332567136222827062478"
//         },
//         {
//             "account": "0x198ef1ec325a96cc354c7266a038be8b5c558f67",
//             "balance": "1040595266314346897222"
//         }
//     ]
//   }
export function getMultiBalance(addrCollection) {
  return request.get(concatUrl(etherScanApi, {
    module: 'account',
    action: 'balancemulti',
    address: addrCollection.join(','),
    tag: 'latest',
    apikey,
  }))
}

// {
//   "status": "1",
//   "message": "OK",
//   "result": "340000000000000000000000000"
// }
export function getERC20TokenAccountBalance(queryAddr) {
  return request.get(concatUrl(etherScanApi, {
    module: 'account',
    action: 'tokenbalance',
    contractaddress: contractData.address[0],
    address: queryAddr,
    tag: 'latest',
    apikey,
  }))
}
