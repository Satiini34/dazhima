
const ctx = wx.createCanvasContext('myCanvas')
Page({
  data: {
    src: ''
  },

  onLoad: function (options) {
    let shop_latitude = wx.getStorageSync('shopCenter').latitude
    let shop_longitude = wx.getStorageSync('shopCenter').longitude
    let shop_id;
    wx.getStorageSync('qrop').is_manager == 2 ? shop_id = wx.getStorageSync('shopCenter').shop_id : shop_id = '';
    this.setData({
      src: 'https://kanjia.bigclient.cn/api/api/showHeatmap?id=' + options.id + '&sort=' + options.sort + '&latitude=' + shop_latitude + '&longitude=' + shop_longitude + '&shop_id=' + shop_id
    })
    // console.log(this.data.src)
  },
})

