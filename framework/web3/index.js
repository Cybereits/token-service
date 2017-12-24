import Web3 from 'web3'

// web3应定要装^1.0.0-beta.24版本！！！！
export default {
    onReady: new Promise((resolve, reject) => {
        resolve(new Web3(new Web3.providers.HttpProvider('http://127.0.0.1:8545')))
    }),
    onWs: new Promise((resolve, reject) => {
        resolve(new Web3(new Web3.providers.WebsocketProvider('ws://127.0.0.1:8546')))
    }),
}
