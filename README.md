# Token-Service

基于以太坊钱包的 ERC-20 代币相关服务

## 开发说明

- 安装 `mongodb`
- 安装 `geth` 钱包
- 安装依赖 `npm run init`
- 运行本地开发网络钱包客户端 `npm run dev-geth`
- 复制 `./src/config/const.example.js` 到 `./src/config/const.js`, 修改相关参数
- 复制 `./src/config/env.example.js` 到 `./src/config/env.js`, 修改相关参数
- 启动服务，`npm run dev`
- graphiql 调试地址 `http://localhost:8010/data`
- graphql Api 地址 `http://localhost:8010/graphql`
- 控制台地址 `http://localhost:8000`

## geth 命令行使用说明

### 调用其它合约的方法

```javascript
// ABI_OBJECT 合约 ABI
// DEPLOY_ADDR 合约部署地址
// 两者都可以在 etherscan 查询到
var contract = eth.contract(ABI_OBJECT).at(DEPLOY_ADDR)
// 解锁转出钱包（转账才需要 查询不需要）
web3.personal.unlockAccount("转出钱包地址","钱包密钥",300)  // 解锁 300 秒
// 调用 ERC-20 标准的 transfer 方法
contract.transfer.sendTransaction("收款地址","代币数量 * 合约 decimal", { from: "转出钱包地址" })
```