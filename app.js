App({
  onLaunch: function () {
    // 登录
    wx.login({
      success: function (res) {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
        wx.request({
          url: 'https://kanjia.bigclient.cn/api/users/returnOpenid',
          method: 'POST',
          header: {
            'content-type': 'application/json' // 默认值
          },
          data: {
            code: res.code
          },
          success: (res) => {
            if (res.data.code == 0) {
              wx.setStorageSync('session_key', res.data.data);
              if(res.data.userInfo == 0 ){
                wx.removeStorageSync('qrop');
              }else {
                wx.setStorageSync('qrop', res.data.userInfo);
              }
            } 
          }
        })
      }
    })

    //获取用户设备信息
    wx.getSystemInfo({
      success: function (res) {
        wx.setStorageSync('systemInfo', res);
      },
    })

    // 获取芝麻粒抵扣比例
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/pay/sesamePercent',
      method: 'POST',
      success(res) {
        if (res.statusCode == 200) {
          wx.setStorage({
            key: "percentange",
            data: res.data
          })
        }
      }
    })
    if (wx.getStorageSync('formReject') == '') wx.setStorageSync('formReject', 0)
  },

  onHide () {
    if(wx.getStorageSync('qrop') != '' && wx.getStorageSync('nowCity') != '') {
      wx.request({
        url: 'https://kanjia.bigclient.cn/api/users/updateLocation',
        method: 'POST',
        data: {
          user_id: wx.getStorageSync('qrop').id,
          location: wx.getStorageSync('nowCity')
        },    
        success(res) {}
      })
    }
  },

  globalData: {
    rsaKey: '-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmyTfjCgg6uDR+Fq8p/OjeuleYzzLjGJlr047c7JEXOPbvWNecI5RJbHlLQJlGRxLqXS54l+B4wzmZVu1wpWH/XUhsvnNp3C/7dl6EXueskPUsARTFFCM/sdhSEoqenAmb9PkRfkBxgn8oLDBX1n2lsie8Gh/k9gJ2HQ7berdzuA4IXmPMkcKGWDOvS1Zdo0/xcrRS7QLdbuGZm5V8hkNbykY6LyghBUrwi252gRc4wvqQDEPHe3VWofrR3YuaHU9qhvOdKPqtBcXtkjJuEVA1/07DJSiWK4TmtwfIDu0S8P+5Puujrj8LVpSLaZcBIQXkJDzsZvJoQ1KAjVeLYbiCwIDAQAB-----END PUBLIC KEY-----'
  }
})