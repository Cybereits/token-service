# token-management-service

## 使用说明

### 启动服务指令

- `npm run start` 启动 pm2 守护进程

### npm run dev-task _taskFileName_ _params_

    开发环境下运行任务脚本（把 dev-task 替换成 prd-task，即可在生产环境下运行任务脚本）
    第一个参数必填，任务文件名（即 ./tasks 目录中的文件名)
    接下来的参数是任务运行时所需的参数,以空格分隔

支持的任务有：

- returnBackEth 从服务器获取需要退回的以太钱包地址和数量 并批量退回
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
- transferAllEth 归集 eth 到指定钱包地址
  - toAddress 归集接收钱包地址
  - fromAddress 转出钱包的地址（默认是 deployOwnerAddr）
  - secret 转出钱包的秘钥（默认是 deployOwnerSecret）
  - adjust 溢价百分比，例如指定 20，则实际使用的油量是当前油量的 120%（默认是 0）
- transferAllToken 归集 ERC-20 代币到指定钱包地址
  - gatherAddress 归集接收钱包地址
  - targetAddress 持有代币的钱包地址（默认是 deployOwnerAddr）
  - targetAddrSecret 持有代币钱包的私钥（默认是 deployOwnerSecret）
  - fromAddr 拨划油费的钱包地址（默认是 deployOwnerAddr）
  - fromAddrSecret 拨划邮费的钱包私钥（默认是 deployOwnerSecret）
- gatherEth 从服务器获取要归集的钱包地址并归集到指定钱包地址
  - gatherAddress 归集接受钱包地址
  - amount 本次批处理的数量
  - secret 批处理钱包的私钥（默认是 deployOwnerSecret）
