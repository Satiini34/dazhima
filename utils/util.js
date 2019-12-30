const RSA = require('./wx_rsa.min.js');
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

function tsFormatTime(timestamp, format) {
  const formateArr = ['Y', 'M', 'D', 'h', 'm', 's'];
  let returnArr = [];

  let date = new Date(timestamp);
  let year = date.getFullYear()
  let month = date.getMonth() + 1
  let day = date.getDate()
  let hour = date.getHours()
  let minute = date.getMinutes()
  let second = date.getSeconds()
  returnArr.push(year, month, day, hour, minute, second);

  returnArr = returnArr.map(formatNumber);

  for (var i in returnArr) {
    format = format.replace(formateArr[i], returnArr[i]);
  }
  return format;
}

function Sesame() {
  wx.request({
    url: 'https://kanjia.bigclient.cn/api/api/getUserInfo',
    method: 'POST',
    data: {
      user_id: wx.getStorageSync('qrop').id
    },
    success: function (res) {
      if (res.data.code == 0) {
        wx.setStorageSync('qrop', res.data.data);
      }
    }
  })
}

function GetformId(n) {
  wx.request({
    url: 'https://kanjia.bigclient.cn/api/api/saveFormId',
    method: 'POST',
    data: {
      user_id: wx.getStorageSync('qrop').id,
      form_id: n
    }
  })
}

module.exports = {
  tsFormatTime: tsFormatTime,
  Sesame: Sesame,
  GetformId: GetformId
}
