require('babel-register')({
  presets: ['es2015', 'stage-0'],
})

const { expect } = require('chai')
const { deployContractEventListeners } = require('../core/scenes/listener')
const { sendToken } = require('../core/scenes/token')
const { deployOwnerAddr, deployOwnerSecret, teamAddr01 } = require('../config/const')
const ContractEvents = require('../core/scenes/listener').default

describe('合约事件监听', () => {
  it('should be listen to contract transfer event', () => new Promise((resolve, reject) => {

    // 添加转账事件监听
    ContractEvents
      .on('Transfer', ({ event }) => {
        expect(event).eq('Transfer', '接收到的事件错误')
        resolve()
      })
      .on('Error', reject)

    // 合约监听部署完成后进行转账交易
    deployContractEventListeners().then(() => {
      sendToken(deployOwnerAddr, deployOwnerSecret, teamAddr01, '1')
        .catch(reject)
    })
  }))
})
