const time = require('../../utils/util.js');
Page({
  data: {
    zhima_detail: [],
    page: 1,
    canReachBottom: true
  },

  onLoad: function (options) {
    var that = this;
    if(options.from == 'activity') {
      let activityData = wx.getStorageSync('activityData').sesame_logs;
      activityData.map( e => {
        e.create_time = time.tsFormatTime(e.create_time * 1000, 'Y-M-D h:m:s');
      })
      that.setData({ 
        zhima_detail: activityData,
        canReachBottom: false
      })
    }else {
      that.Myzhima(); 
    }
  },

  Myzhima () {
    var that = this;
    let page = this.data.page
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/getSesameLogs',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id,
        p: page
      },
      success(res) {
        for (let i = 0; i < res.data.data.length; i++) {
          res.data.data[i].create_time = time.tsFormatTime(res.data.data[i].create_time * 1000, 'Y-M-D h:m:s');
        }
        let zhimaMy = [];
        zhimaMy = that.data.zhima_detail.concat(res.data.data)
        setTimeout(function(){
          that.setData({
            zhima_detail: zhimaMy
          })
        },250)
      }
    })
  },

  onReachBottom: function () {
    var that = this;
    if(this.data.canReachBottom == true) {
      that.setData({
        page: that.data.page + 1
      })
      that.Myzhima();
    }
  },
})