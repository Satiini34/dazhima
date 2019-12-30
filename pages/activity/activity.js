const app = getApp();
const RSA = require('../../utils/wx_rsa.min.js');
let timer, danmu;
Page({
  data: {
    ruleShow: false,
    hasDanmu: false,
    progressWidth: 3,
    beCashWidth: 0,
    cashNum: 0,
    days: '',
    hours: '',
    minutes: '',
    seconds: '',
    cashRank: [],
    trends_info: '',
    actData: '',
    remain_share:'',
    inviters: ''
  },

  onLoad (options) {
    this.Activity();
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/activityData',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id
      },
      success(res) {
        if(res.data.code == 0){
          wx.setStorageSync('activityData', res.data.data)
        }
      }
    })
  },

  sesameDetail () {
    wx.navigateTo({
      url: '../myZhima/myZhima?from=activity',
    })
  },

  activityRule () {
    this.setData({ ruleShow: true })
  },

  ruleClose () {
    this.setData({ ruleShow: false })
  },

  // NumDH(num) {
  //   var that = this;
  //   let i = 0;
  //   if(i <= num) {
  //     let roll = setInterval( () => {
  //       that.setData({
  //         cashNum: i,
  //       })
  //       i++
  //       if (i > num) clearInterval(roll)
  //     }, 50)
  //   }
  // },

  toCash () {
    var that = this;
    if(this.data.cashNum >= 30) {
      if (this.data.actData.amount <= 1) {
        wx.showToast({
          title: '暂无可提现金额',
          icon: 'none'
        })
      }else {
        wx.showModal({
          title: '确认提现',
          content: '可提现额度为' + that.data.actData.amount,
          cancelText: '取消',
          confirmText: '提现',
          success (res) {
            if(res.confirm) {
              let withdraw;
              if (pareInt(that.data.actData.withdraw_amount) + parseInt(that.data.actData.amount) >= 366) {
                withdraw = 366 - parseInt(that.data.actData.withdraw_amount);
              }else {
                withdraw = that.data.actData.withdraw_amount;
              }
              let newStr = {
                user_id: wx.getStorageSync('qrop').id,
                sesame: withdraw * 100
              };
              let newStr1 = JSON.stringify(newStr);
              //rsa加密
              let key = app.globalData.rsaKey;
              let encrypt_rsa = new RSA.RSAKey();
              encrypt_rsa = RSA.KEYUTIL.getKey(key);
              let encStr = encrypt_rsa.encrypt(newStr1);
              encStr = RSA.hex2b64(encStr);
              wx.request({
                url: 'https://kanjia.bigclient.cn/api/pay/withdraw2',
                method: 'POST',
                data: {
                  encrypted_data: encStr
                },
                success(res) {
                  if (res.data.code == 0) {
                    wx.showToast({
                      title: '提现成功!',
                      mask: true
                    })
                    that.Activity();
                  } else {
                    wx.showToast({
                      title: res.data.msg,
                      icon: 'none'
                    })
                  }
                },
                fail() {
                  wx.showToast({
                    title: res.data.msg,
                    icon: 'none'
                  })
                }
              })
            }
          }
        })
      }
    }else {
      wx.showToast({
        title: '30元以上才能开启提现哦',
        icon: 'none'
      })
    }
  },

  Activity () {
    var that = this;
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/getActivityInfo',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id
      },
      success(res) {
        if (res.data.code == 0) {
          if(res.data.data == '') {
            that.setData({
              inviters: 0,
              cashNum: 0,
              remain_share: 0,
            })
          } else{
            that.setData({
              cashRank: res.data.chart,
              actData: res.data.data,
              inviters: res.data.data.invite_num,
            })
            // 进度条计算
            let cashNumAdd = parseFloat(res.data.data.amount) + parseFloat(res.data.data.withdraw_amount);
            let cashNum = cashNumAdd.toFixed(2)
            // 剩余分享好友个数
            if (parseInt(cashNum) >= parseInt(30)) {
              that.setData({ remain_share: 0 })
            } else {
              that.setData({ remain_share: parseInt(30) - parseInt(cashNum) })
            }
            let beCashNum = res.data.data.withdraw_amount;
            let progressWidth, beCashWidth;
            if (cashNum == 0) {
              progressWidth = 3;
              that.setData({ progressWidth, cashNum })
            } else if (cashNum <= 30) {
              progressWidth = 100 * cashNum / 30;
              beCashWidth = 100 * beCashNum / 30
              that.setData({ progressWidth, beCashWidth, cashNum })
            } else {
              // if (res.data.data.withdraw_amount != 0) {
              if (beCashNum != 0) {
                if (cashNum <= 120) {
                  progressWidth = (cashNum - 28) / 90 * 50;
                  that.setData({ progressWidth, cashNum })
                } else if (cashNum > 120 && cashNum <= 366) {
                  progressWidth = 50 + (cashNum - 132) / 246 * 50;
                  that.setData({ progressWidth, cashNum })
                }else {
                  cashNum = 366;
                  progressWidth = 50 + (cashNum - 132) / 246 * 50;
                  that.setData({ progressWidth, cashNum })
                }
                // that.NumDH(cashNum);
                // 已提现
                if (beCashNum <= 120) {
                  beCashWidth = (beCashNum - 29) / 90 * 50;
                  that.setData({ beCashWidth })
                } else {
                  beCashWidth = 50 + (beCashNum - 132) / 246 * 50;
                  that.setData({ beCashWidth })
                }
              } else {
                // 未提现
                if (cashNum <= 120) {
                  progressWidth = (cashNum - 28) / 90 * 50;
                  that.setData({ progressWidth, cashNum })
                } else {
                  if (cashNum >= 366) cashNum = 366;
                  progressWidth = 50 + (cashNum - 132) / 246 * 50;
                  that.setData({ progressWidth, cashNum })
                }
              }
            }
          }

          //计时器
          let newSec, newMin, newHour, newDay;
          let date = Date.parse(new Date()) / 1000;
          let leftTime = res.data.activity_end - date;
          timer = setInterval(function () {
            // let timerD = leftTime;
            let timerd = Math.floor(leftTime / 86400);
            let timerh = Math.floor(leftTime % 86400 / 3600);
            let timerm = Math.floor(leftTime % 3600 / 60);
            let timers = Math.floor(leftTime % 60);
            if (timers == 0 && timerm == 0 && timerh == 0 && timerd == 0) {
              clearInterval(timer);
              wx.showToast({
                title: '本活动已结束,敬请期待下一场！',
                icon: 'none',
                duration: 2000
              })
              setTimeout(() => {
                wx.navigateBack({
                  delta: 1
                })
              }, 2000)
            }
            if (timers < 10) {
              newSec = '0' + timers;
            } else {
              newSec = timers;
            }
            if (timerm < 10) {
              newMin = '0' + timerm;
            } else {
              newMin = timerm;
            }
            if (timerh < 10) {
              newHour = '0' + timerh;
            } else {
              newHour = timerh;
            }
            newDay = timerd;
            leftTime--;
            that.setData({
              minutes: newMin,
              hours: newHour,
              seconds: newSec,
              days: newDay,
            })
          }, 1000)

          res.data.trends.length != 0 ? that.setData({ hasDanmu: true, trends_info: res.data.trends[0] }) : that.setData({ hasDanmu: false })
          let j = 0;
          danmu = setInterval(() => {
            j++
            if (j == res.data.trends.length) {
              j = 0;
            }
            that.setData({
              trends_info: res.data.trends[j]
            })
          }, 6000)
        }
      }
    })
  },

  onUnload () {
    clearInterval(timer);
    clearInterval(danmu);
  },

  onShareAppMessage: function () {

  }
})