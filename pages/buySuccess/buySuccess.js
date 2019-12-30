const RSA = require('../../utils/wx_rsa.min.js');
Page({
  data: {
    goodsList: []
  },
  onLoad: function (options) {
    var that = this;
    this.setData({
      goodsList: wx.getStorageSync('other_goods')
    })
    wx.removeStorageSync('paySuccess')
  },

  //跳转详情页
  goodItem: function (e) {
    wx.navigateTo({
      url: '../goodItem/goodItem?good_id=' + e.currentTarget.id,
    })
  },

  // 砍价
  bargin: function (e) {
    var that = this;
    let good_id = e.target.id;
    let share_goods = e.currentTarget.dataset.img.split(',')[0]
    this.setData({
      goods_id: good_id,
      goods_pic: share_goods
    })
    let type;
    wx.getStorageSync('userLocation') != '' ? type = 1 : type = 0;
    // RSA加密
    let newStr = {
      user_id: wx.getStorageSync('qrop').id,
      goods_id: good_id,
      latitude: wx.getStorageSync('userLocation').latitude,
      longitude: wx.getStorageSync('userLocation').longitude,
      share_id: '',
      type
    };
    let newStr1 = JSON.stringify(newStr);
    //rsa加密
    let key = '-----BEGIN PUBLIC KEY-----MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDGEyi2N93UCPPrYU1jPbd9df1nA0b5YvWABggETPWsZLHHZlf7SbaT+7yMg6pZ/3xcPchF37np8C3LB13KSd6+ZE4XtYZ0zXTwJMZhFmVTz9rGnYQ19rTlYvG6E+UmQCno8Wxd3qUwXlM4a3rmI92uisZVZO7Db60UFY7XFHE/cQIDAQAB-----END PUBLIC KEY-----'
    let encrypt_rsa = new RSA.RSAKey();
    encrypt_rsa = RSA.KEYUTIL.getKey(key);
    let encStr = encrypt_rsa.encrypt(newStr1);
    encStr = RSA.hex2b64(encStr);
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/bargainList',
      method: 'POST',
      data: {
        encrypted_data: encStr
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.showToast({
            title: '成功砍价' + res.data.data.bargain + '元',
            duration: 2000,
            mask: true
          })
          setTimeout(function () {
            wx.request({
              url: 'https://kanjia.bigclient.cn/api/api/dailyGoodsList',
              method: 'POST',
              data: {
                latitude: wx.getStorageSync('userLocation').latitude,
                longitude: wx.getStorageSync('userLocation').longitude,
                user_id: wx.getStorageSync('qrop').id,
                type: 1
              },
              success: function (res) {
                that.setData({
                  goodsList: res.data.data
                })
              }
            })
          }, 700)
        } else if (res.data.code == 30001) {
          that.setData({
            shareShow: true
          })
        } else if (res.data.code == 30007) {
          wx.showToast({
            title: '该商品已被别人抢先下单，暂不能砍价！',
            icon: 'none',
            duration: 2000,
            mask: false
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
    wx.removeStorageSync('paySuccess');
  },

  back() {
    wx.switchTab({
      url: '../index/index',
    })
  },
})