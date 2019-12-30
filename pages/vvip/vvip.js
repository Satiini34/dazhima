const time = require('../../utils/util.js');
const RSA = require('../../utils/wx_rsa.min.js');
const app = getApp();
Page({
  data: {
    nickName: '',
    cashout_record: [],
    info: '',
    recordShow: false,
    cashType: 'number'
  },

  onLoad: function (options) {
    var that = this;
    if(options.shopCenter == 1){
      that.setData({
        nickName: wx.getStorageSync('qrop').nickname,
        info: '您的可提现额度为' + wx.getStorageSync('shopCenter').sale_profit + '元',
        recordShow: false,
        cashType: 'digit'
      })
      wx.setNavigationBarTitle({
        title: '商家提现',
      })
    }else {
      that.setData({
        nickName: wx.getStorageSync('qrop').nickname,
        info: '您的可提现额度为' + wx.getStorageSync('qrop').sesame / 100 + '元',
        recordShow: true
      })
      wx.setNavigationBarTitle({
        title: '达人提现',
      })
      wx.request({
        url: 'https://kanjia.bigclient.cn/api/pay/withdrawLogs',
        method: 'POST',
        data: {
          user_id: wx.getStorageSync('qrop').id,
        },
        success(res) {
          for (let i = 0; i < res.data.data.length; i++) {
            res.data.data[i].create_time = time.tsFormatTime(res.data.data[i].create_time * 1000, 'Y-M-D h:m:s');
          }
          that.setData({
            cashout_record: res.data.data
          })
        }
      })
    }
  },

  cashSubmit (e) {
    var that = this;
    // 走商家提现
    if (that.data.recordShow == false) {
      that.ShopCenter(e);
    }else {
      // 走达人提现
      that.Vvip(e);
    }
  },

  // 跳转商家提现记录
  shopCenter_record () {
    wx.navigateTo({
      url: '../shopCenterCash/shopCenterCash?id=' + wx.getStorageSync('qrop').id,
    })
  },

  // 达人提现
  Vvip (e) {
    if (parseInt(e.detail.value.zhima) >= 20 && parseInt(e.detail.value.zhima) <= 500) {
      if (parseInt(wx.getStorageSync('qrop').sesame) >= parseInt(e.detail.value.zhima) * 100) {
        wx.showLoading({
          title: '提现中',
          mask: true
        })
        wx.request({
          url: 'https://kanjia.bigclient.cn/api/pay/withdraw',
          method: 'POST',
          data: {
            user_id: wx.getStorageSync('qrop').id,
            sesame: e.detail.value.zhima * 100
          },
          success(res) {
            if (res.data.code == 0) {
              wx.hideLoading();
              wx.showToast({
                title: '提现成功!',
                mask: true
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
                    let pagesNow = getCurrentPages();
                    let prepage1 = pagesNow[pagesNow.length - 2];
                    let prepage2 = pagesNow[pagesNow.length - 3];
                    prepage1.setData({
                      'allzhima': res.data.data.sesame
                    })
                    prepage2.setData({
                      'all_sesame': res.data.data.sesame
                    })
                  }
                  setTimeout( () => {
                    wx.navigateBack({
                      delta: 1
                    })
                  }, 350)
                }
              })
            } else {
              wx.hideLoading();
              wx.showToast({
                title: res.data.msg,
                icon: 'none',
                mask: true
              })
            }
          }
        })
      } else {
        wx.hideLoading();
        wx.showToast({
          title: '抱歉，您的芝麻粒不足！',
          icon: 'none'
        })
      }
    } else {
      wx.showToast({
        title: '请输入正确的提现金额',
        icon: 'none'
      })
    }
  },

  // 商家提现
  ShopCenter(e) {
    var that = this;
    if (parseInt(wx.getStorageSync('shopCenter').sale_profit) >= parseInt(e.detail.value.zhima) && parseInt(e.detail.value.zhima) >= 0.3 && parseInt(e.detail.value.zhima) <= 500) {
      wx.showLoading({
        title: '提现中',
        mask: true
      })
      let newStr = {
        user_id: wx.getStorageSync('qrop').id,
        amount: e.detail.value.zhima
      };
      let newStr1 = JSON.stringify(newStr);
      //rsa加密
      let key = app.globalData.rsaKey;
      let encrypt_rsa = new RSA.RSAKey();
      encrypt_rsa = RSA.KEYUTIL.getKey(key);
      let encStr = encrypt_rsa.encrypt(newStr1);
      encStr = RSA.hex2b64(encStr);
      wx.request({
        url: 'https://kanjia.bigclient.cn/api/pay/withdrawForShop',
        method: 'POST',
        data: {
          encrypted_data: encStr
        },
        success: function (res) {
          if(res.data.code == 0){
            wx.hideLoading();
            wx.showToast({
              title: '提现成功',
              mask: true
            })
            wx.request({
              url: 'https://kanjia.bigclient.cn/api/api/shopCenter',
              method: 'POST',
              data: {
                user_id: wx.getStorageSync('qrop').id
              },
              success: function (res) {
                if (res.data.code == 0) {
                  wx.setStorageSync('shopCenter', res.data.data.statistics)
                  let pagesNow = getCurrentPages();
                  let prepage1 = pagesNow[pagesNow.length - 2];
                  prepage1.setData({
                    'shop.sale_profit': res.data.data.statistics.sale_profit
                  })
                }
                setTimeout(function () {
                  wx.navigateBack({
                    delta: 1
                  })
                }, 350)
              }
            })
          }else {
            wx.hideLoading();
            wx.showToast({
              title: res.data.msg,
              icon: 'none',
              mask: true
            })
          }
        }
      })
    } else wx.showToast({ title: '请输入正确的金额呀', icon: 'none' })
  }
})