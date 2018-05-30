require('babel-register')({
  presets: ['es2015', 'stage-0'],
})

// 将之前生成的钱包信息同步到数据库
// 暂时没有处理 secret
const { ethWalletConnect, creWalletConnect } = require('../framework/web3')
const { ethAccountModel } = require('../core/schemas');

(async function () {
  let eth_accounts = []
  let cre_accounts = []
  let accounts = []

  eth_accounts = await ethWalletConnect.eth.getAccounts()
  cre_accounts = await creWalletConnect.eth.getAccounts()
  accounts = [...new Set(eth_accounts.concat(cre_accounts))]

  accounts.forEach(async (account) => {
    await ethAccountModel.findOneAndUpdate(
      { account },
      {
        account,
        group: eth_accounts.indexOf(account) > -1 ? 'eth' : 'cre',
        comment: '系统钱包',
      },
      { upsert: true },
    ).catch((err) => {
      console.log(`[${account}] 信息记录失败: ${err.message}`)
    })
  })

  console.log('同步完成')
})()
