const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return [year, month, day].map(formatNumber).join('/') + ' ' + [hour, minute, second].map(formatNumber).join(':')
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : '0' + n
}

// ArrayBuffer转16进度字符串示例
function ab2hex(buffer) {
  var hexArr = Array.prototype.map.call(
    new Uint8Array(buffer),
    function (bit) {
      return ('00' + bit.toString(16)).slice(-2)
    }
  )
  return hexArr.join('');
}
function convert(str) {
  let str_list = str.split("")
  let buffer = new ArrayBuffer(str_list.length / 2)
  let dataView = new DataView(buffer)
  for (let i = 0; i < str_list.length / 2; i++) {
    dataView.setUint8(i, parseInt(`0x${str_list[2 * i]}${str_list[2 * i + 1]}`))
  }
  return buffer
}

module.exports = {
  formatTime: formatTime,
  ab2hex: ab2hex,
  convert
}
