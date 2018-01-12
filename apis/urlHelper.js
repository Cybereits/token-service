const matchReg = /([?&][^#?&=]*=?[^#?&]*)+/ig
const anchorReg = /#[^?]*/ig

export function getParams(url) {
  let anchorMatches = url.match(anchorReg)
  let temp = url
  let matches = temp.match(matchReg)
  let matchStr = matches ? matches[0] : undefined
  let params = {}
  let action = temp.substr(0,
    temp.length -
    (matchStr ? matchStr.length : 0) -
    (anchorMatches ? anchorMatches[0].length : 0))

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

export function concatUrl(url, params, needEncode = true) {
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
          p += `${n}=${v}&`
        })
      } else {
        p += `${n}=${newParams[n]}&`
      }
    }
    return p
  }, `${action}?`)

  let ret = temp.substr(0, temp.length - 1) + (anchorMatches ? anchorMatches[0] : '')
  if (needEncode) { return encodeURI(ret) } else { return ret }
}

export default {
  matchReg,
  anchorReg,
}
