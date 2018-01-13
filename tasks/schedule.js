import schedule from 'node-schedule'
import runTask from './wallet'

const rule = new schedule.RecurrenceRule()
// rule.second = [0, 10, 20, 30, 40, 50]
rule.minutes = 5

function scheduleCronstyle() {
  schedule.scheduleJob(rule, async () => {
    console.log('触发定时任务')
    runTask()
      .catch((err) => {
        console.error(`定时任务执行失败:${JSON.stringify(err, null, 4)}`)
      })
  })
}

export default scheduleCronstyle
