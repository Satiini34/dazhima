const time = require('../../utils/util.js');
Page({
  data: {
    userLogin: true,
    disabled: false,
    coupon_id: '',
    coupon: '',
    btnName: '立即领取',
    beginTime: '',
    toDay: '',
    conponDis: ''
  },

  onLoad (options) {
    var that = this;
    this.setData({ coupon_id: options.id})
    wx.getStorageSync('qrop') != '' ? this.setData({ userLogin: false }) : this.setData({ userLogin: true })
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/couponDetail',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id,
        coupon_id: options.id
      },  
      success(res) {
        if (res.data.code == 0) {
          let discount = (res.data.data.discount * 10).toFixed(1)
          if(discount.split('.')[1] == '0') {
            discount = discount.slice(0, 1) + '折'
          } else {
            discount = discount + '折'
          }
          that.setData({
            coupon: res.data.data,
            conponDis: discount
          })
          // 有效期
          let expire = new Date(new Date(new Date().toLocaleDateString()).getTime() + parseInt(res.data.data.expire_day) * 24 * 60 * 60 * 1000 - 1 );
          let expireDay = Date.parse(expire);
          let expireDayTo = time.tsFormatTime(expireDay, 'Y-M-D h:m:s');
          let beginTime = time.tsFormatTime( new Date(), 'Y-M-D')
          that.setData({
            beginTime,
            toDay: expireDayTo
          })
        }
      }
    })
  },

  //授权
  bindgetuserinfo (e) {
    var that = this;
    wx.getUserInfo({
      success: res => {
        wx.request({
          url: 'https://kanjia.bigclient.cn/api/users/decryptData',
          method: 'POST',
          data: {
            iv: res.iv,
            data: res.encryptedData,
            session_key: wx.getStorageSync('session_key').session_key,
            inviter_id: wx.getStorageSync('inviterId')
          },
          success (res) {
            wx.setStorageSync('qrop', res.data.data);
            that.setData({ userLogin: false })
            // 授权后默认领券
            wx.request({
              url: 'https://kanjia.bigclient.cn/api/api/getCoupon',
              method: 'POST',
              data: {
                user_id: wx.getStorageSync('qrop').id,
                coupon_id: that.data.coupon_id
              },
              success(res) {
                if (res.data.code == 0) {
                  that.setData({
                    btnName: '立即使用'
                  })
                  wx.showToast({
                    title: '领券成功',
                  })
                }else {
                  that.Recieve()
                }
              },
              fail () {
                that.Recieve()
              }
            })
          }
        })
      }
    })
  },

  Recieve () {
    var that = this;
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/getCoupon',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id,
        coupon_id: that.data.coupon_id
      },
      success(res) {
        if (res.data.code == 0) {
          that.setData({
            btnName: '立即使用'
          })
          wx.showToast({
            title: '领券成功',
          })
        }
      }
    })
  },

  couponUse () {
    var that = this;
    if(this.data.btnName == '立即领取') {
      that.Recieve();
    }else {
      wx.navigateBack({
        delta: 1
      })
    }
  },
})