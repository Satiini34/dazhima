const wxCharts = require('../../utils/wxcharts-min.js');
const RSA = require('../../utils/wx_rsa.min.js');
Page({
  data: {
    versionBelow: true,
    scrollTop: 0,
    is_choice: 1,
    shop: [],
    customers: [],
    deal: 0,
    checked: 0,
    unchecked: 0,
    expired: 0,
    see_no_consume: 0,
    kanjia_no_consume: 0,
    is_withdraw: false,
    click_num: 0,
    expose_num: 0,
    share_num: 0,
    shops: [],
    shopSel: false,
    whichShop: false
  },

  onLoad: function (options) {
    var that = this;
    let shopIdShow = options.id
    //获取版本信息
    wx.getSystemInfo({
      success: function (res) {
        let user_version = res.version.slice(0, 1)
        if (user_version >= 7) {
          that.setData({
            versionBelow: true
          })
        } else {
          that.setData({
            versionBelow: false
          })
        }
      }
    })
    let menuRect = wx.getMenuButtonBoundingClientRect();
    this.setData({
      menuRectTop: menuRect.top,
      doubleMenuRectTop: menuRect.top * 2
    }) 

    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/userBindShops',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id
      },
      success (res) {
        if(res.data.code == 0){
          if (res.data.data == '') {
            let n = '';
            that.ShopSel(n)
            that.setData({ whichShop: false })
          } else {
            that.setData({
              shops: res.data.data,
              whichShop: true
            })
            let n = shopIdShow;
            that.ShopSel(n)
          }
        }else {
          wx.showToast({
            title: '网络异常请重试',
            icon: 'none'
          })
          setTimeout( ()=> {
            wx.navigateBack();
          }, 1200)
        }
      }  
    })
  },

  ShopSel(n) {
    var that = this;
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/shopCenter',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id,
        shop_id: n
      },
      success: function (res) {
        if (res.data.code == 0) {
          let deal, checked, expired, unchecked
          wx.setStorageSync('shop_deal', res.data.data.deal_data);
          if (res.data.data.deal_data != '') {
            deal = res.data.data.deal_data.all.length
            checked = res.data.data.deal_data.checked.length
            expired = res.data.data.deal_data.expired.length
            unchecked = res.data.data.deal_data.unchecked.length
          }
          let male = res.data.data.customers.male
          let female = res.data.data.customers.female
          let other = res.data.data.customers.other
          let customers = res.data.data.customers
          let see_no_consume = customers.click_unpaid_num / (customers.click_unpaid_num + customers.bargain_unpaid_num) * 97
          let kanjia_no_consume = 97 - see_no_consume
          let i = 0;
          numDH();
          function numDH() {
            if (i < 200) {
              setTimeout(() => {
                that.setData({
                  click_num: i * 8,
                  expose_num: i * 12,
                  share_num: i * 6
                })
                i++
                numDH();
              }, 1)
            } else {
              that.setData({
                expose_num: res.data.data.statistics.total.exposure_num,
                click_num: res.data.data.statistics.total.click_num,
                // bargain_num: res.data.data.statistics.total.bargain_num,
                share_num: res.data.data.statistics.total.share_num
              })
            }
          }
          that.setData({
            shop: res.data.data.statistics,
            customers,
            deal,
            checked,
            unchecked,
            expired,
            see_no_consume,
            kanjia_no_consume
          })
          wx.setStorageSync('shopCenter', res.data.data.statistics)
          new wxCharts({
            canvasId: 'canvas1',
            type: 'pie',
            series: [{ name: '男', data: male }, { name: '女', data: female }, { name: '未知', data: other }],
            width: 250,
            height: 200,
            dataLabel: true,
          });
        } else {
          getCurrentPages()[getCurrentPages().length - 1].onLoad()
        }
      },
      fail() {
        getCurrentPages()[getCurrentPages().length - 1].onLoad()
      }
    })

    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/getChartData',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id,
        shop_id: n
      },
      success: function (res) {
        wx.setStorageSync('chartData', res.data.data)
      }
    })
  },

  manager_check:function(){
    wx.navigateTo({
      url: '../managerCheck/managerCheck',
    })
  },

  //核销方式
  hexiao_way() {
    wx.navigateTo({
      url: '../managerCheck/managerCheck?id=' + this.data.shop.shop_id,
    })
  },

  // 核销记录
  hexiao_record() {
    wx.navigateTo({
      url: '../shopCenterSale/shopCenterSale?id=2',
    })
  },

  // 点击数据
  expose_data (){
    wx.navigateTo({
      url: '../chartData/chartData?id=expose',
    })
  },

  // 砍价数据
  click_data() {
    wx.navigateTo({
      url: '../chartData/chartData?id=click',
    })
  },

  // 分享数据
  share_data() {
    wx.navigateTo({
      url: '../chartData/chartData?id=share',
    })
  },

  // 成交
  deal() {
    wx.navigateTo({
      // url: '../shopCenterSale/shopCenterSale?id=deal',
      url: '../shopCenterSale/shopCenterSale?id=1',
    })
  },

  // 核销
  checked() {
    wx.navigateTo({
      // url: '../shopCenterSale/shopCenterSale?id=checked',
      url: '../shopCenterSale/shopCenterSale?id=2',
    })
  },

  // 未核销
  unchecked() {
    wx.navigateTo({
      // url: '../shopCenterSale/shopCenterSale?id=unchecked',
      url: '../shopCenterSale/shopCenterSale?id=3',
    })
  },

  // 订单过期
  expired() {
    wx.navigateTo({
      // url: '../shopCenterSale/shopCenterSale?id=expired',
      url: '../shopCenterSale/shopCenterSale?id=4',
    })
  },

  onPageScroll: function (e) {
    let proportion = 750 / wx.getStorageSync('systemInfo').windowWidth;
    let scrollTop = e.scrollTop * proportion;
    this.setData({
      scrollTop: scrollTop
    });
  },

  navBarCustomBack: function () {
    wx.navigateBack({
      delta: 1,
    })
  },

  all:function(){
    this.setData({
      is_choice: 1
    })
  },

  today:function(){
    this.setData({
      is_choice: 2
    })
  },

  yesterday:function(){
    this.setData({
      is_choice: 3
    })
  },

  week: function () {
    this.setData({
      is_choice: 4
    })
  },

  // 商家提现
  wantCash () {
    wx.navigateTo({
      url: '../vvip/vvip?shopCenter=1',
    })
  },

  // 商家切换
  changeShop () {
    this.setData({
      shopSel: true
    })
  },

  faceClose () {
    this.setData({ shopSel: false })
  },

  whichShop (e) {
    this.ShopSel(e.target.id)
    this.setData({ shopSel: false })
  }
})