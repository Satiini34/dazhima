Page({
  data: {
    shop_id: '',
    src: ''
  },

  onLoad: function (options) {
    this.setData({ 
      shop_id: options.id,
      src: wx.getStorageSync('shopCenter').qrcode
    })
  },

  codeSubmit:function(e){ 
    var that = this;
    console.log(e.detail.value)
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/users/useCdkey',
      method: 'POST',
      data: {
        shop_id: that.data.shop_id,
        cdkey: e.detail.value.cdkey
      },
      success: function (res) {
        if(res.data.code == 0){
          wx.showToast({
            title: '核销成功!',
          })
          setTimeout(function(){
            wx.navigateBack({
              delta: 1,
            })
          },1500)
        }else {
          wx.showToast({
            title: '请输入正确的核销码',
            icon: 'none'
          })
        }
      }
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },
})