const matchReg = /([?&][^#?&=]*=?[^#?&]*)+/ig
const anchorReg = /#[^?]*/ig

/**
 * 获取链接地址中的参数
 * @param {string} url 链接地址
 */
export function getParams(url) {
  let anchorMatches = url.match(anchorReg)
  let temp = url
  let matches = temp.match(matchReg)
  let matchStr = matches ? matches[0] : undefined
  let params = {}
  let action = temp.substr(
    0,
    temp.length -
    (matchStr ? matchStr.length : 0) -
    (anchorMatches ? anchorMatches[0].length : 0),
  )

  if (matchStr) {
    // 拆出参数数组
    let arr = matchStr.substr(1).split(/[?=&]/g)
    let i = 0
    while (i < arr.length) {
      params[arr[i]] = i + 1 < arr.length ? arr[i + 1] : undefined
      i += 2
    }
  }

  return {
    action,
    params,
    hash: anchorMatches,
  }
}

/**
 * 拼接参数生成 url
 * @param {string} url 链接地址
 * @param {object} params 参数对象
 * @param {boolean} need_encode 是否需要 encode
 */
export function concatUrl(url, params, need_encode = true) {
  // 参数不为对象 或 参数为空对象 返回原字符串
  if (!(params instanceof Object) || Object.keys(params).length === 0) {
    return url
  }

  let {
    params: newParams,
    hash: anchorMatches,
    action,
  } = getParams(url)

  // 如果同名参数有了值则覆盖
  Object.assign(newParams, params)
  let temp = Object.keys(newParams).reduce((p, n) => {
    if (typeof newParams[n] !== 'undefined') {
      if (newParams[n] instanceof Array) {
        let arr = newParams[n]
        arr.forEach((v) => {
          p += `${n}[]=${v}&`
        })
      } else {
        p += `${n}=${newParams[n]}&`
      }
    }
    return p
  }, `${action}?`)

  let ret = temp.substr(0, temp.length - 1) + (anchorMatches ? anchorMatches[0] : '')

  if (need_encode) {
    return encodeURI(ret)
  }

  return ret
}

export default {
  matchReg,
  anchorReg,
}
