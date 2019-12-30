Page({
  data: {
    userInfo: '',
    allContent: '',
    goodsSel: '筛选商品名',
    startTime: '筛选起始日期',
    overTime: '筛选结束日期',
    goodsSelId: ''
  },

  onLoad (options) {
    var that = this;
    this.setData({ userInfo: wx.getStorageSync('qrop') })
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/saleCenter',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id
      },
      success(res) {
        if (res.data.code == 0) {
          that.setData({ allContent: res.data.data })
        } else {
          wx.showToast({
            title: '网络异常请重试',
            icon: 'none'
          })
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 1400)
        }
      },
      fail () {
        wx.showToast({
          title: '网络异常请重试',
          icon: 'none'
        })
        setTimeout( ()=> {
          wx.navigateBack({
            delta: 1
          })
        }, 1400)
      }
    })

    // 折线图
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/getSaleChart',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id
      },
      success(res) { 
        if (res.data.code == 0) {
          res.data.data.day.x = res.data.data.day.x.reverse();
          res.data.data.day.sale_num = res.data.data.day.sale_num.reverse();
          res.data.data.day.sale_total = res.data.data.day.sale_total.reverse();
          wx.setStorage({
            key: 'saleChart',
            data: res.data.data,
          })
        }
      } 
    })
  },

  sale_yesterday () {
    wx.navigateTo({
      url: '../saleChart/saleChart?url=saleDay',
    })
  },

  sale_week () {
    wx.navigateTo({
      url: '../saleChart/saleChart?url=saleWeek',
    })
  },

  sale_month () {
    wx.navigateTo({
      url: '../saleChart/saleChart?url=saleMonth',
    })
  },

  saleA_yesterday () {
    wx.navigateTo({
      url: '../saleChart/saleChart?url=amountDay',
    })
  },

  saleA_week () {
    wx.navigateTo({
      url: '../saleChart/saleChart?url=amountWeek',
    })
  },

  saleA_month() {
    wx.navigateTo({
      url: '../saleChart/saleChart?url=amountMonth',
    })
  },


  // 数据筛选
  timeStart (e) {
    this.setData({ startTime: e.detail.value})
  },

  timeOver (e) {
    this.setData({ overTime: e.detail.value })
  },

  goodsSel (e) {
    var that = this;
    let index = e.detail.value;
    this.setData({
      goodsSel: that.data.allContent.goods[index].goods_name,
      goodsSelId: that.data.allContent.goods[index].id
    })
  },

  fliter () {
    var that = this;
    let startTime, overTime;
    this.data.startTime == '筛选起始日期' ? startTime == '' : startTime = this.data.startTime;
    this.data.overTime == '筛选结束日期' ? overTime == '' : overTime = this.data.overTime;
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/saleCenter',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id,
        start_time: startTime,
        end_time: overTime,
        goods_id: that.data.goodsSelId
      },
      success(res) {
        if (res.data.code == 0) {
          if(res.data.data.goods_sale == '') {
            wx.showToast({ title: '无筛选数据', icon: 'none' })
          } else {
            that.setData({ allContent: res.data.data })
          }
        }
      }
    })
  },

  // 商家切换
  changeShop() {
    this.setData({
      shopSel: true
    })
  },

  // 跳转商家
  whichShop (e) {
    wx.navigateTo({
      url: '../shopCenter/shopCenter?id=' + e.target.id,
    })
  },

  faceClose() {
    this.setData({ shopSel: false })
  }
})