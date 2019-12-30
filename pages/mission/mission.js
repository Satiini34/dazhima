const Sesame = require('../../utils/util.js');
Page({
  data: {
    allzhima: '',
    zhimali: '',
    sign_in_day: '',
    new_: '',
    old_: '',
    bargain: '',
    kanfinish: '',
    sharefinish: '',
    followfinish: '',
    isVvip: false,
    mpweixinShow: false,
    precent: '40'
  },

  onLoad: function (options) {
    var that = this;
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/signIn',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id
      },
      success: function (res) {
        if (res.data.code == 0) {
          // 砍价
          res.data.data.bargain.num >= 20 ? res.data.data.bargain.num = 20 : res.data.data.bargain.num = res.data.data.bargain.num
          if (res.data.data.bargain.num == res.data.data.bargain.limit){
            that.setData({
              kanfinish: true
            })
          }else {
            that.setData({
              kanfinish: false
            })
          }
          // 分享
          if(res.data.data.new.num == res.data.data.new.limit && res.data.data.old.num == res.data.data.old.limit){
            that.setData({
              sharefinish: true
            })
          }else {
            that.setData({
              sharefinish: false
            })
          }
          // 关注公众号
          wx.getStorageSync('qrop').subscribe_time != null ? that.setData({ followfinish: true }) : that.setData({ followfinish: false })
          let zhimali = res.data.data.get_sesame;
          let sign_in_day = res.data.data.sign_in_day;
          let new_ = res.data.data.new;
          let old_ = res.data.data.old;
          let bargain = res.data.data.bargain;
          that.setData({
            zhimali,
            sign_in_day,
            new_,
            old_,
            bargain,
            precent: parseInt(wx.getStorageSync('percentange') * 100)
          })
        }else {
          wx.showToast({
            title: '网络异常！',
            icon: 'none'
          })
          setTimeout(function(){
            wx.navigateBack({
              delta: 1
            })
          },1000)
        }
      },
    })

    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/getUserInfo',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.setStorageSync('qrop', res.data.data);
          let allzhima = res.data.data.sesame;
          that.setData({ allzhima })
          res.data.data.vvip == 1 ? that.setData({ isVvip: true }) : that.setData({ isVvip: false })
        }
      }
    })
  },

  // 跳转大V提现
  isVvip () {
    wx.navigateTo({
      url: '../vvip/vvip',
    })
  },

  // 关注公众号
  mpweixin () {
    this.setData({
      mpweixinShow: true
    })
  },

  closeMp () {
    this.setData({
      mpweixinShow: false
    })
  },
})