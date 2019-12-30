const time = require('../../utils/util.js');
Page({
  /**
   * 页面的初始数据
   */
  data: {
    cashout_record: [],
    picShow: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/pay/withdrawLogsForShop',
      method: 'POST',
      data: {
        user_id: options.id
      },
      success(res) {
        if(res.data.code ==0){
          console.log(res);
          if(res.data.data.length !=0){
            for (let i = 0; i < res.data.data.length; i++) {
              res.data.data[i].create_time = time.tsFormatTime(res.data.data[i].create_time * 1000, 'Y-M-D h:m:s');
            }
            that.setData({
              cashout_record: res.data.data,
              picShow: true
            })
          }else {
            that.setData({
              picShow: false
            })
          }
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },
})