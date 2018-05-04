// 通用状态
export const STATUS = {
  pending: 0, // 待处理
  sending: 1, // 处理中
  success: 2, // 成功
  failure: -1,  // 失败
}

// 代币类型
export const TOKEN_TYPE = {
  eth: 'eth',
  cre: 'cre',
  eos: 'eos',
  gxs: 'gxs',
}

const statusKeys = Object.keys(STATUS)

export function getStatus(_value) {
  return statusKeys.filter(t => STATUS[t] === _value)[0]
}
