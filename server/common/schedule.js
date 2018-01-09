import schedule from 'node-schedule'

import web3 from '../../framework/web3'
import { TaskCapsule, ParallelQueue } from '../utils/task'
import request from '../../framework/request'
import config from '../../config/env'

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

const taskQueue = new ParallelQueue({
  onFinished: () => {
    console.log(`查询成功的地址数量${balanceArr.length}`)
    console.log(`总币量${total}`)
    request.post(`${config.apiServer}/walet`, {
      'data': balanceArr,
    })
      .then((res) => {
        console.log(`${config.apiServer}/walet: ${res}`)
      })
      .catch((err) => { console.log(err) })
  },
})

const rule = new schedule.RecurrenceRule()
// rule.second = [0, 10, 20, 30, 40, 50]
rule.minute = 5

function scheduleCronstyle() {
  schedule.scheduleJob(rule, async () => {
    let listAccounts = await getListAccounts()
    let list = listAccounts.listAccounts
    balanceArr = []
    console.log(`地址数量${list.length}`)
    for (let i = 0; i < list.length; i += 1) {
      taskQueue.add(
        new TaskCapsule(() =>
          new Promise((resolve, reject) =>
            getBalance(list[i])
              .then((res) => {
                total += +res.user.amount
                balanceArr.push(res.user)
                resolve('succ')
              })
              .catch(reject)),
        ),
      )
    }
    taskQueue.consume()
  })
}

export default {
  scheduleCronstyle,
}
