# eth-service

ETH service for cybereits internal usage.

## 使用方法

#### yarn transaction
> 查询本地

#### yarn total
> 通过 ehterscan.io 的 api 接口查询 addr.json 文件中指定钱包地址内的 eth 总量

#### yarn wallet
> 从 php 服务器获取要查询的地址列表，通过本地的 geth 客户端查询地址中的 eth 数量 (每五分钟一次的定时任务)

#### yarn dtc
> 部署代币合约

在实现时分为两个合约：CybereitsToken(代币合约)，CybereitsTeamLock(锁仓合约)  

具体实现如下

 - 在初始化代币合约的 balances 时，预留锁仓的份额记录在锁仓合约地址对应的 balance 中。
 - 锁仓合约中记录 6 个团队钱包地址，每个地址对应的锁仓时间不同。
 - 锁仓合约中提供一个公开的解锁方法，可以在指定团队钱包地址冻结期结束后解锁锁仓合约 balance 中的份额到指定的团队钱包地址。

> 在部署代币将从根目录的 `config/const.js` 中读取:
> 1. 代币总数(tokenSupply)
> 2. 代币精度(contractDecimals)
> 3. 团队锁定百分比(teamLockPercent)
> 4. 团队钱包地址1-6(teamAddr01 - teamAddr06)
>
> 并且在后续的接口、任务中将持续使用这些变量进行计算，例如查询指定地址的代币数量等


## 常量配置说明

- etherScanApi: ehterscan.io 的公共接口地址
- apiKey: etherscan.io 授权 key
- deployOwnerAddr: 合约部署的钱包地址
- deployOwnerSecret: 合约部署钱包的密码
- gas: ethereum 网络油量
- gasPrice: ethereum 网络油价
- tokenSupply: 代币总量
- contractDecimals: 代币精度
- teamLockPercent: 团队锁仓比例
- teamAddr01...06: 团队解锁钱包地址