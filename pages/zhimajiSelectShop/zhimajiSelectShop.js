Page({

  /**
   * 页面的初始数据
   */
  data: {
    shops: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/shopSelection',
      method: 'POST',
      success(res) {
        if (res.data.code == 0) {
          that.setData({ shops: res.data.data })
        } else {
          wx.showToast({
            title: '网络异常',
            icon: 'none'
          })
        }
      }
    })
  },

  // 关联商家
  shopChoose(e) {
    let pages = getCurrentPages();
    let prepage = pages[pages.length - 2];
    prepage.setData({
      'shopName': e.currentTarget.dataset.shopname,
      'shopCircle': e.currentTarget.dataset.all.circle_name,
      'shopSort': e.currentTarget.dataset.all.subcategory_name,
      'shop_id': e.target.id,
      'textValue': '更换',
      'relativeShopShow': true
    })
    setTimeout(()=> {
      wx.navigateBack({
        delta: 1
      })
    },100)
  },
})