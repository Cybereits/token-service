# eth-service

ETH service for cybereits internal usage.

> 在接下来的说明中指令 `yarn` 可被替换做 `npm run`

## 开发说明

- 安装 `geth` 钱包
- 运行本地开发网络钱包客户端 `yarn dev-geth`
- 复制 `config/const.example.js` 到 `config/const.js`, 修改相关参数
- 部署代币合约 `yarn dtc`
- 启动本地 http 服务，`yarn dev`
- 查询官方代币账户： `http://localhost:3100/officialBalance`

## 使用说明

#### yarn dtc
> 部署代币合约

在实现时分为两个合约：CybereitsToken(代币合约)，CybereitsTeamLock(锁仓合约)  

具体实现如下

 - 在初始化代币合约的 balances 时，预留锁仓的份额记录在锁仓合约地址对应的 balance 中。
 - 锁仓合约中记录 6 个团队钱包地址，每个地址对应的锁仓时间不同。
 - 锁仓合约中提供一个公开的解锁方法，可以在指定团队钱包地址冻结期结束后解锁锁仓合约 balance 中的份额到指定的团队钱包地址。

> 在部署代币将从根目录的 `config/const.js` 中读取:
> 1. 代币总数(tokenSupply)
> 2. 代币精度(contractDecimals)
> 3. 团队锁定百分比(teamLockPercent)
> 4. 团队钱包地址1-6(teamAddr01 - teamAddr06)
>
> 并且在后续的接口、任务中将持续使用这些变量进行计算，例如查询指定地址的代币数量等

#### yarn dev-task _taskFileName_ _params_

    开发环境下运行任务脚本（把 dev-task 替换成 prd-task，即可在生产环境下运行任务脚本）
    第一个参数必填，任务文件名（即 ./tasks 目录中的文件名)
    接下来的参数是任务运行时所需的参数,以空格分隔

支持的任务有：

- abiArguments 从 token.json 中获取合约 abi，从 const.js 中获取合约编译时的参数，生成 abi-encoded arguments
- deployTokenContract 部署代币合约，即 `yarn dtc`
- getTotal 通过 ehterscan.io 的 api 接口查询 addr.json 文件中指定钱包地址内的 eth 总量，即 `yarn total`
- getTransaction 查询本地生成账户中的 eth 数量, 即 `yarn transaction`
- getTransFromLocal 扫描本地生成账户和指定的区块区间，生成对应账户的 eth，cre 余额和所有的 transactions
- returnBackEth 从服务器获取需要退回的以太钱包地址和数量 并批量退回
- wallet 从 php 服务器获取要查询的地址列表，通过本地的 geth 客户端查询地址中的 eth 数量 (每五分钟一次的定时任务)，即 `yarn wallet`
- schedule 启动定时任务，每五分钟执行一次 `wallet` 任务
- sendETH 发起 eth 转账，接受参数 `toAddress, amount, fromAddress, secret` 分别代表:
  - toAddress 转到的钱包地址
  - amount 转出数量（eth 数量，不是 wei）
  - fromAddress 转出钱包的地址（默认是 deployOwnerAddr）
  - secret 转出钱包的秘钥（默认是 deployOwnerSecret）
- sendToken 发起 token 转账，接受参数 `toAddress, amount, fromAddress, secret` 分别代表:
  - toAddress 转到的钱包地址
  - amount 转出数量（代币数量，不是 wei）
  - fromAddress 转出钱包的地址（默认是 deployOwnerAddr）
  - secret 转出钱包的秘钥（默认是 deployOwnerSecret）
- unlock 解锁团队锁仓份额, 接受参数 index 表示解锁团队钱包地址的序号：1-6

## 常量配置说明

- etherScanApi: ehterscan.io 的公共接口地址
- apiKey: etherscan.io 授权 key
- deployOwnerAddr: 合约部署的钱包地址
- deployOwnerSecret: 合约部署钱包的密码
- gas: ethereum 网络油量
- gasPrice: ethereum 网络油价
- tokenSupply: 代币总量
- contractDecimals: 代币精度
- teamLockPercent: 团队锁仓比例
- teamAddr01...06: 团队解锁钱包地址