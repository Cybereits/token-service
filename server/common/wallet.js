require('babel-register')({
  presets: ['es2015', 'stage-0'],
})

const web3 = require('../../framework/web3').default
const Task = require('./task').default
const request = require('../../framework/request').default

const config = require('../../config/env')

var balanceArr = []
let total = 0

async function getListAccounts() {
  let connect = await web3.onWs
  let [listAccounts, code, msg] = [[], 200, '']
  try {
    code = 200
    listAccounts = await connect.eth.getAccounts()
  } catch (error) {
    code = -1
    msg = error.toString()
  }
  return {
    code,
    listAccounts,
    msg,
  }
}

async function getBalance(address) {
  let connect = await web3.onWs
  let [user, code, msg, amount] = [{}, 200, '', '']
  try {
    code = 200
    amount = await connect.eth.getBalance(address)
    amount = connect.eth.extend.utils.fromWei(amount, 'ether')
    user = { address, amount }
  } catch (error) {
    code = -1
    msg = error.toString()
  }
  return {
    code,
    user,
    msg,
  }
}

const taskQueue = new Task.ParallelQueue(() => {
  console.log(`查询成功的地址数量${balanceArr.length}`)
  console.log(`总币量${total}`)
  request.post(`${config.apiServer}/walet`, {
    'data': balanceArr,
  })
    .then((res) => {
      console.log(`${config.apiServer}/walet: ${res}`)
    })
    .catch((err) => { console.log(err) })
})

async function scheduleCronstyle() {
  let listAccounts = await getListAccounts()
  let list = listAccounts.listAccounts
  balanceArr = []
  console.log(`地址数量${list.length}`)
  for (let i = 0; i < list.length; i += 1) {
    taskQueue.add(
      new Task.TaskCapsule(() =>
        new Promise((resolve, reject) =>
          getBalance(list[i])
            .then((res) => {
              // console.log(`record ${i + 1}`)
              total += +res.user.amount
              balanceArr.push(res.user)
              resolve('succ')
            })
            .catch(reject)),
      ),
    )
  }
  taskQueue.consume()
}

scheduleCronstyle()
