import request from '../framework/request'
import { apiServer } from '../config/env'
import { setTimeout } from 'timers';

// 同步本地 geth 客户端记录到的钱包 eth 账户信息
export const postBalances = balanceArr => request.post(`${apiServer}/walet`, {
  data: balanceArr,
})

// 同步 etherscan 接口查询到的本地账户 eth 转账信息
export const postTransactions = transactionList => request.post(`${apiServer}/trans`, {
  data: transactionList,
})

// 获取要分发的代币数据
export const getDistributeTokenInfo = () => request.get(`${apiServer}/dicoin`)
  .then((res) => {
    if (+res.code === 0) {
      return res['data']
    } else {
      throw new Error(`请求代币分发信息接口出错:${JSON.stringify(res, null, 4)}`)
    }
  })

// 获取已分发的代币数据
export const getDistributeSentInfo = () => request.get(`${apiServer}/cresending`)
  .then((res) => {
    if (+res.code === 0) {
      return res['data']
    } else {
      throw new Error(`请求代币分发信息接口出错:${JSON.stringify(res, null, 4)}`)
    }
  })

// 同步代币已发送信息
export const syncTokenSent = addrCollection => request.post(`${apiServer}/cresending`, {
  data: addrCollection,
})

// 同步代币发送成功信息
export const syncTokenSendingSucc = addrCollection => request.post(`${apiServer}/cresuccess`, {
  data: addrCollection,
})

// 获取退回 eth 的用户信息
export const getReturnBackInfo = () => new Promise((resolve) => {
  setTimeout(() => resolve([
    {
      "name": "杨建国",
      "mobile": "18008377333",
      "email": "17531031@qq.com",
      "idno": "510724197207250017",
      "reg_address": "0xEAf756800E3c28073e02B94b1CA9dEA02dB899C3",
      "sys_address": "0xA2a7d2f87dbb0550dc4E8D09ACCCAB5b33149497",
      "reg_amount": "5.0000000000",
      "accept_amount": "5.0000000000",
      "receive_amount": "10.0000000000",
      "return_amount": "5.0000000000"
    },
    {
      "name": "胡进波",
      "mobile": "13505149119",
      "email": "jinbo.x.hu@gmail.com",
      "idno": "429004197910030959",
      "reg_address": "0x17AA5cb54f6e2d0D1455bc09bb36af33bDa3c790",
      "sys_address": "0xC0F7BA42F812d45F02BFF08b32Ed7C1B4785EdEA",
      "reg_amount": "5.0000000000",
      "accept_amount": "5.0000000000",
      "receive_amount": "10.0000000000",
      "return_amount": "5.0000000000"
    },
    {
      "name": "周星火",
      "mobile": "13968858654",
      "email": "xinghuozhou@gmail.com",
      "idno": "330302198501241219",
      "reg_address": "0x9c4ce634307592BCA4d74828fed0d8D58043E53e",
      "sys_address": "0xB50e9Df2D1FCff866590fa3104447fb70F6A9c5c",
      "reg_amount": "5.0000000000",
      "accept_amount": "5.0000000000",
      "receive_amount": "10.0000000000",
      "return_amount": "5.0000000000"
    },
    {
      "name": "黄兵平",
      "mobile": "13905050292",
      "email": "hhhbp@163.com",
      "idno": "350521197302061556",
      "reg_address": "0xd4b700692A98941b89269bC34b0CAa73cD8a4C01",
      "sys_address": "0xe03515b84B288Bd0De8eF1fF8533367080Cd925a",
      "reg_amount": "5.0000000000",
      "accept_amount": "5.0000000000",
      "receive_amount": "15.0000000000",
      "return_amount": "10.0000000000"
    },
    {
      "name": "李哲",
      "mobile": "18612987536",
      "email": "577737418@qq.com",
      "idno": "421223198907126711",
      "reg_address": "0x58970975B249CbcB3092bAB22cb8c088B03aC9eE",
      "sys_address": "0x5fC3787F1A43EA6149DA3529D9bb34Ed0E225793",
      "reg_amount": "5.0000000000",
      "accept_amount": "5.0000000000",
      "receive_amount": "10.0000000000",
      "return_amount": "5.0000000000"
    },
    {
      "name": "苏鹏飞",
      "mobile": "15161608523",
      "email": "461598956@qq.com",
      "idno": "32028119881128655X",
      "reg_address": "0x0404E69CffAa2F0a90EB87f1AeA1f93bB787c247",
      "sys_address": "0xbD3e8d41eD2b6DfDF505b18A4Ec2860564d24010",
      "reg_amount": "4.0000000000",
      "accept_amount": "4.0000000000",
      "receive_amount": "5.0000000000",
      "return_amount": "1.0000000000"
    },
    {
      "name": "吕鑫",
      "mobile": "13911962380",
      "email": "3646156@qq.com",
      "idno": "120104198010280814",
      "reg_address": "0x5CAA7EfD433651D8095A48d13D72c33256940Ce9",
      "sys_address": "0x044Fbc73F63D6694fECD99Fe1fcC9D51C0D7ad19",
      "reg_amount": "5.0000000000",
      "accept_amount": "5.0000000000",
      "receive_amount": "10.0000000000",
      "return_amount": "5.0000000000"
    },
    {
      "name": "许方",
      "mobile": "13733801704",
      "email": "896774307@qq.com",
      "idno": "41290119650211304X",
      "reg_address": "0xFf3A281C720E117D8eC42316e998b1f6c95E7Bc4",
      "sys_address": "0x02C73548CCFD4c08a2c5153A962355a01415dBb7",
      "reg_amount": "3.0000000000",
      "accept_amount": "3.0000000000",
      "receive_amount": "4.0000000000",
      "return_amount": "1.0000000000"
    },
    {
      "name": "杨健",
      "mobile": "18576001932",
      "email": "598348276@qq.com",
      "idno": "442000199305102038",
      "reg_address": "0x5ef443d995427434983d826db4be4bde41aa5839",
      "sys_address": "0x65f0eB93Ba4bEB827d3f0BDF076376F77d45a262",
      "reg_amount": "5.0000000000",
      "accept_amount": "5.0000000000",
      "receive_amount": "10.0000000000",
      "return_amount": "5.0000000000"
    },
    {
      "name": "褚恩伟",
      "mobile": "15040701900",
      "email": "1475920005@qq.com",
      "idno": "210381197004254813",
      "reg_address": "0x25e3919C011cC163CEaC305E0045A7690d2371B6",
      "sys_address": "0x0251D40aa4089841DE9C4F3048Af0B84Ec43DC3d",
      "reg_amount": "5.0000000000",
      "accept_amount": "5.0000000000",
      "receive_amount": "10.0000000000",
      "return_amount": "5.0000000000"
    },
    {
      "name": "许淑梅",
      "mobile": "13663065995",
      "email": "xsmlzy6688@163.com",
      "idno": "410928196603220045",
      "reg_address": "0x181C1bEd48129513751bD905e6AD679821E0D394",
      "sys_address": "0x26F12E3e149a662955123C4735b78D597D9DC56c",
      "reg_amount": "2.0000000000",
      "accept_amount": "2.0000000000",
      "receive_amount": "4.0000000000",
      "return_amount": "2.0000000000"
    },
    {
      "name": "蔡肖秋",
      "mobile": "15821550778",
      "email": "caixiaoqiu111@163.com",
      "idno": "330329197608291668",
      "reg_address": "0xA4bC7A39722787F64125BA3Ea6855a0898797B61",
      "sys_address": "0x80872111D88B6049777491625C3feCfA9F1b56fC",
      "reg_amount": "2.0000000000",
      "accept_amount": "2.0000000000",
      "receive_amount": "5.0000000000",
      "return_amount": "3.0000000000"
    },
    {
      "name": "武昊天",
      "mobile": "13176779186",
      "email": "1009916306@qq.com",
      "idno": "370883199009225337",
      "reg_address": "0x76c086343C600545C391C60DBEabED0498ADe479",
      "sys_address": "0xE048A09974be4A95F76c52c5618B26B244614Afb",
      "reg_amount": "2.0000000000",
      "accept_amount": "2.0000000000",
      "receive_amount": "3.0400000000",
      "return_amount": "1.0400000000"
    },
    {
      "name": "修杰东",
      "mobile": "18626273286",
      "email": "edu.cxzzl@foxmail.com",
      "idno": "230230198711170232",
      "reg_address": "0xF7c4dE210b4565583E29C9adB6dA506f588e815f",
      "sys_address": "0x9B24dD1d6aEa7144f2D8246FdF3C1A189E911de3",
      "reg_amount": "1.0000000000",
      "accept_amount": "1.0000000000",
      "receive_amount": "3.0000000000",
      "return_amount": "2.0000000000"
    },
    {
      "name": "税敏",
      "mobile": "18681359310",
      "email": "48154203@qq.com",
      "idno": "510723198411280297",
      "reg_address": "0x634E39AaC037859cD7446331E370f914E7d40ad9",
      "sys_address": "0x82A006542706fffCFb0e3a0b3b6AC93AA3329930",
      "reg_amount": "5.0000000000",
      "accept_amount": "5.0000000000",
      "receive_amount": "10.0000000000",
      "return_amount": "5.0000000000"
    },
    {
      "name": "李晓芹",
      "mobile": "13915627384",
      "email": "egdjin002@163.com",
      "idno": "321023197905191406",
      "reg_address": "0xd7248406ef7f174F8a0B3D2C9bFd446F617F5716",
      "sys_address": "0x2fA4B8DfB6e811a0cF4DD22C955841EC468F4839",
      "reg_amount": "1.0000000000",
      "accept_amount": "1.0000000000",
      "receive_amount": "2.0000000000",
      "return_amount": "1.0000000000"
    },
    {
      "name": "祖晓龙",
      "mobile": "13845246353",
      "email": "zuxiaolongsir@163.com",
      "idno": "230229197305060038",
      "reg_address": "0x15B8F0025bf66b5d9eB2f4e552C6ECAc8AFe4194",
      "sys_address": "0xfb00Cb46B189631235C67144fD0D882d68B15D4E",
      "reg_amount": "5.0000000000",
      "accept_amount": "5.0000000000",
      "receive_amount": "10.0000000000",
      "return_amount": "5.0000000000"
    },
    {
      "name": "陈鑫",
      "mobile": "15252020060",
      "email": "313708315@qq.com",
      "idno": "41152819920416347X",
      "reg_address": "0x7A4B92B8354d1343fa967E0aAa3D49F3B0223122",
      "sys_address": "0xdC9fd39180E92a0D2F7cC01BB2eF6dDEb0383Ef8",
      "reg_amount": "2.0000000000",
      "accept_amount": "2.0000000000",
      "receive_amount": "5.0000000000",
      "return_amount": "3.0000000000"
    },
    {
      "name": "马利红",
      "mobile": "18190766536",
      "email": "1930797647@qq.com",
      "idno": "510129197105163720",
      "reg_address": "0x8Bd69d178c48492F7961c6FC51b7f9Ecf71Cf64d",
      "sys_address": "0x772d0A4Ae9e1df263db02e37123345087Cbb617D",
      "reg_amount": "1.0000000000",
      "accept_amount": "1.0000000000",
      "receive_amount": "2.0000000000",
      "return_amount": "1.0000000000"
    },
    {
      "name": "陶金",
      "mobile": "18625242158",
      "email": "110513553@qq.com",
      "idno": "320520198305170910",
      "reg_address": "0x5E68Ee328536F3A92fada83b03327A04CA88b5Ef",
      "sys_address": "0xAFAc0BED3D51BEE41C6A46D4e50f5bE76E6f4a49",
      "reg_amount": "1.0000000000",
      "accept_amount": "1.0000000000",
      "receive_amount": "2.0000000000",
      "return_amount": "1.0000000000"
    },
    {
      "name": "向黎明",
      "mobile": "13929296417",
      "email": "565038937@qq.com",
      "idno": "432522197205045755",
      "reg_address": "0xA943f6b8446e463b0db5a5F6F068542483CBDBF1",
      "sys_address": "0x6113E5e3A8e4eff62a6AF7203F42D5C9bda208Fd",
      "reg_amount": "5.0000000000",
      "accept_amount": "5.0000000000",
      "receive_amount": "10.0000000000",
      "return_amount": "5.0000000000"
    },
    {
      "name": "张金峰",
      "mobile": "17180285608",
      "email": "pepsiall@gmail.com",
      "idno": "210122197911210311",
      "reg_address": "0x9f59452C10970D8692Ff2189B472c0f443D1e7cd",
      "sys_address": "0x519693C8248a928A95F3a4276a1C743272841279",
      "reg_amount": "5.0000000000",
      "accept_amount": "5.0000000000",
      "receive_amount": "10.0000000000",
      "return_amount": "5.0000000000"
    },
    {
      "name": "孙荣华",
      "mobile": "18842362098",
      "email": "2404615229@qq.com",
      "idno": "210111196110052524",
      "reg_address": "0x391A814DB6C05dcd9c646757BFB407453cccb90E",
      "sys_address": "0xA8C16D0ec70a4626b7A2728cd0338601181a519d",
      "reg_amount": "1.0000000000",
      "accept_amount": "1.0000000000",
      "receive_amount": "2.0000000000",
      "return_amount": "1.0000000000"
    },
    {
      "name": "陈玲",
      "mobile": "15304170888",
      "email": "chenling0888@126.com",
      "idno": "210882196810093929",
      "reg_address": "0xB1C4bcb52d707327d9c5CD0f866cFAB492567a67",
      "sys_address": "0x620CFcc951C4e68ce37d6206c699761FAa3eA9DC",
      "reg_amount": "5.0000000000",
      "accept_amount": "5.0000000000",
      "receive_amount": "10.0000000000",
      "return_amount": "5.0000000000"
    },
    {
      "name": "南宗辰",
      "mobile": "13941393593",
      "email": "383035656@qq.com",
      "idno": "210411198702033816",
      "reg_address": "0x5Cd6a9657550b24A3B7755B30C0173d478cBb290",
      "sys_address": "0x1c739A8D36B365113F93da4bc36e9B7f3b804C2f",
      "reg_amount": "5.0000000000",
      "accept_amount": "0.0000000000",
      "receive_amount": "2.0000000000",
      "return_amount": "2.0000000000"
    },
    {
      "name": "赵科",
      "mobile": "13801363051",
      "email": "13801363051@139.com",
      "idno": "110221198811068338",
      "reg_address": "0xAF98B208E37526c5A8b499f526D7807DDb08e75A",
      "sys_address": "0x97C26Af3f23893b124d681306432456CAD8875c3",
      "reg_amount": "5.0000000000",
      "accept_amount": "5.0000000000",
      "receive_amount": "10.7900000000",
      "return_amount": "5.7900000000"
    },
    {
      "name": "高红乐",
      "mobile": "15620625516",
      "email": "gaohongle@126.com",
      "idno": "140202198910010517",
      "reg_address": "0x050493D0188C3bdF21a7A8CFee5Ed7ACa7f3c928",
      "sys_address": "0xa10A4C3568A7b17E3B2f9Ee5C31f4d1B2de53c99",
      "reg_amount": "1.0000000000",
      "accept_amount": "1.0000000000",
      "receive_amount": "5.0000000000",
      "return_amount": "4.0000000000"
    },
    {
      "name": "任宇",
      "mobile": "13732235369",
      "email": "renyuxvv@163.com",
      "idno": "421087199008122173",
      "reg_address": "0x7E5B63408b358AE84FEF1E941BFbF808d558B824",
      "sys_address": "0x6945f6A3a1c206470DD3E59aF049a48947F05FcC",
      "reg_amount": "1.0000000000",
      "accept_amount": "1.0000000000",
      "receive_amount": "2.0000000000",
      "return_amount": "1.0000000000"
    },
    {
      "name": "于民",
      "mobile": "18353203547",
      "email": "1472309561@qq.com",
      "idno": "370785198810191470",
      "reg_address": "0xD983a7D3326e3Aa4Ab77633E1a0a32d28914550d",
      "sys_address": "0x77368332404D48CA51D61fB43473F48b17642241",
      "reg_amount": "5.0000000000",
      "accept_amount": "5.0000000000",
      "receive_amount": "10.0000000000",
      "return_amount": "5.0000000000"
    },
    {
      "name": "徐一彤",
      "mobile": "18368080659",
      "email": "526573993@qq.com",
      "idno": "330183199306012818",
      "reg_address": "0xdc6926A3E419f96A84c5aEA722e68E8CD8070D18",
      "sys_address": "0x7D750b483F56F738B46400a232F61e0B7Fc45378",
      "reg_amount": "2.0000000000",
      "accept_amount": "2.0000000000",
      "receive_amount": "5.0000000000",
      "return_amount": "3.0000000000"
    },
    {
      "name": "夏海罗",
      "mobile": "15958301112",
      "email": "474899209@qq.com",
      "idno": "330302198505245911",
      "reg_address": "0xBEB29fc374e05139B3332ACfFB7A539370b74988",
      "sys_address": "0x37D8e656819C06aB04a7b6a28C45A507E66a2fbd",
      "reg_amount": "5.0000000000",
      "accept_amount": "5.0000000000",
      "receive_amount": "10.0000000000",
      "return_amount": "5.0000000000"
    },
    {
      "name": "高彩霞",
      "mobile": "13674726878",
      "email": "13674726878@163.com",
      "idno": "150207197501152329",
      "reg_address": "0x21777060505aE944d603F7E7Aa33806c7648F2DE",
      "sys_address": "0x7894f2E37eB137e68C4f95b1b10714245d0e5E9e",
      "reg_amount": "1.0000000000",
      "accept_amount": "1.0000000000",
      "receive_amount": "2.0000000000",
      "return_amount": "1.0000000000"
    },
    {
      "name": "陆大云",
      "mobile": "13988975772",
      "email": "poorsm@126.com",
      "idno": "530381198511033918",
      "reg_address": "0x6A1e83dE01537376Fd00244EdE613B38B9E28f63",
      "sys_address": "0x5b51f04346a4637742676A3b4636b8a1F9A1B046",
      "reg_amount": "5.0000000000",
      "accept_amount": "0.0000000000",
      "receive_amount": "5.0000000000",
      "return_amount": "5.0000000000"
    },
    {
      "name": "何媛媛",
      "mobile": "13632257542",
      "email": "qiaog34080295@sina.com",
      "idno": "510681199604234628",
      "reg_address": "0x8947A8697A4Df3f6EE0b8DB2ab96F08B4C1FDd4E",
      "sys_address": "0x74871a92064698A2f2fd39816476fD78563Fbd0A",
      "reg_amount": "4.0000000000",
      "accept_amount": "4.0000000000",
      "receive_amount": "5.0000000000",
      "return_amount": "1.0000000000"
    },
    {
      "name": "陈俊扬",
      "mobile": "13706090806",
      "email": "forestshoe@139.com",
      "idno": "350322197212194318",
      "reg_address": "0xDaf67129693D46B6d700B6aa74B9c84059183180",
      "sys_address": "0xdb72EB13615caE4e108efa2d5e5F883D6535340E",
      "reg_amount": "1.0000000000",
      "accept_amount": "1.0000000000",
      "receive_amount": "2.0000000000",
      "return_amount": "1.0000000000"
    },
    {
      "name": "傅杰",
      "mobile": "13706067762",
      "email": "675770139@qq.com",
      "idno": "350303197510080010",
      "reg_address": "0x44FC8b2CCF6d59874b73f52e869Fcf31740AC7DA",
      "sys_address": "0xE53c2ACbcD41E4fCdb4B3019891fdDDDC9A6036A",
      "reg_amount": "1.0000000000",
      "accept_amount": "1.0000000000",
      "receive_amount": "2.0000000000",
      "return_amount": "1.0000000000"
    },
    {
      "name": "郭锦",
      "mobile": "18506000491",
      "email": "799568859@qq.com",
      "idno": "350181199412022295",
      "reg_address": "0xEc48F7708325891B5f4FCFF80b5Ac503440aF8C1",
      "sys_address": "0x3728942f25d51aBD817ED2E13d247973Bf2cbadA",
      "reg_amount": "1.0000000000",
      "accept_amount": "1.0000000000",
      "receive_amount": "2.0000000000",
      "return_amount": "1.0000000000"
    },
    {
      "name": "王云飞",
      "mobile": "17706315678",
      "email": "652801459@qq.com",
      "idno": "371082197806119619",
      "reg_address": "0xde5c0ad1e14175a2f7334168cc773c1d1ccf3e1f",
      "sys_address": "0xA0FE95e354f9e8D42f12781B30516Ad97d219773",
      "reg_amount": "3.2000000000",
      "accept_amount": "0.0000000000",
      "receive_amount": "6.4000000000",
      "return_amount": "6.4000000000"
    },
    {
      "name": "王懋瀚",
      "mobile": "13568250870",
      "email": "wmh666wmh6@163.com",
      "idno": "513823199008190016",
      "reg_address": "0xcB92eDe683cf2E26B1Febc5A2101E829b830e626",
      "sys_address": "0xCDC16C17d612F790C06E278f5D13a3180432d3bB",
      "reg_amount": "1.0000000000",
      "accept_amount": "1.0000000000",
      "receive_amount": "3.0000000000",
      "return_amount": "2.0000000000"
    }
  ]), 1000)
})

// export const getReturnBackInfo = () => request.get(`${apiServer}/return`)
//   .then((res) => {
//     if (+res.code === 0) {
//       return res['data']
//     } else {
//       throw new Error(`请求退回 eth 的用户信息出错:${JSON.stringify(res, null, 4)}`)
//     }
//   })

// 提交返还 eth 的结果信息
export const submitReturnBackSendResult = result => request.post(`${apiServer}/return`, {
  data: result,
})
