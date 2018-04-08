import schedule from 'node-schedule'
import runTask from './wallet'

function scheduleCronstyle() {
  // 每五分钟执行一次
  // cron-like 表达式参考 https://github.com/node-schedule/node-schedule
  schedule.scheduleJob('*/5 * * * *', async () => {
    console.log('触发定时任务')
    runTask()
      .catch((err) => {
        console.error(`定时任务执行失败:${JSON.stringify(err, null, 4)}`)
      })
  })
}

export default scheduleCronstyle
