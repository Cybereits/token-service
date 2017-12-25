require('babel-register')({
  presets: ['es2015', 'stage-0'],
})

const web3 = require('../../framework/web3').default
const Task = require('./task').default
const schedule = require('node-schedule')
const request = require('../../framework/request')

const config = require('../../config/env')

var balanceArr = []

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
  console.log(balanceArr.length)
  // request.post(config.apiServer, balanceArr)
  //   .then((res) => {
  //     console.log(res)
  //   })
  //   .catch((err) => { console.log(err) })
}, 1)

const rule = new schedule.RecurrenceRule()
// rule.second = [0, 30]
rule.minute = 5

function scheduleCronstyle() {
  schedule.scheduleJob(rule, async () => {
    let listAccounts = await getListAccounts()
    let list = listAccounts.listAccounts
    balanceArr = []
    console.log(list.length)
    for (let i = 0; i < list.length; i += 1) {
      taskQueue.add(
        new Task.TaskCapsule(() =>
          new Promise((resolve, reject) =>
            getBalance(list[i])
              .then((res) => {
                // console.log(`record ${i + 1}`)
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

scheduleCronstyle()
