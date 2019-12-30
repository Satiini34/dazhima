Page({
  data: {
    toTop: false,
    howfar: 0,
    src: ''
  },

  onPageScroll: function (e) {
    this.setData({
      howfar: e.scrollTop
    })
  },

  top () {
    var that = this;
    this.setData({
      toTop: true
    })
    setTimeout(()=> {
      that.setData({
        toTop: false
      })
      wx.pageScrollTo({
        scrollTop: 0,
        duration: 300,
      })
    },200)
  },

  onReady: function () {
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      src: 'http://kanjia.bigclient.cn/upload/reward3.png'
    })
    setTimeout(() => wx.hideLoading(),1000)
  },
})