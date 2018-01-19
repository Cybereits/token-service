// import request from '../framework/request'
import { getReturnBackInfo } from '../apis/phpApis'

export default () => {
  // request.get('https://www.baidu.com')
  getReturnBackInfo()
    .then((res) => {
      console.log(res)
    })
    .catch((err) => {
      console.error(err)
    })
}
