const wxCharts = require('../../utils/wxcharts-min.js');
let chart = null;
Page({
  data: {
    days: 1,
    data_name: '',
    data_x: [],
    data_y: [],
    height: 250,
    width: '',
    parameter: '',
    canIsee: false
  },

  onLoad: function (options) {
    var that = this;
    if(options.id == 'expose'){
      that.setData({ 
        data_name: '看见我的',
        data_x: wx.getStorageSync('chartData').exposure_data.seven_day.x,
        data_y: wx.getStorageSync('chartData').exposure_data.seven_day.y,
        width: wx.getStorageSync('systemInfo').screenWidth,
      })
      wx.setNavigationBarTitle({
        title: '看见我的',
      })
      chart = new wxCharts({
        canvasId: 'lineCanvas',
        type: 'line',
        // extra: {
        //   lineStyle: 'curve'
        // },
        // categories: wx.getStorageSync('chartData').click_data.seven_day.x,
        categories: that.data.data_x,
        series: [{
          name: '日期',
          data: that.data.data_y,
          // format: function (val) {
          //   return val + '次';
          // }
        }],
        yAxis: {
          // title: '成交金额 (万元)',
          format: function (val) {
            return val + '次';
          },
          min: 0
        },
        width: wx.getStorageSync('systemInfo').screenWidth,
        height: 250,
        dataLabel: true
      })
    } else if (options.id == 'share'){
      that.setData({ 
        data_name: '传播我的',
        data_x: wx.getStorageSync('chartData').share_data.seven_day.x,
        data_y: wx.getStorageSync('chartData').share_data.seven_day.y,
        width: wx.getStorageSync('systemInfo').screenWidth,
        parameter: 'setShareHeatmapData',
        canIsee: true
      })
      wx.setNavigationBarTitle({
        title: '传播我的',
      })
      chart = new wxCharts({
        canvasId: 'lineCanvas',
        type: 'line',
        // extra: {
        //   lineStyle: 'curve'
        // },
        categories: that.data.data_x,
        series: [{
          name: '日期',
          data: that.data.data_y,
        }],
        yAxis: {
          format: function (val) {
            return val + '次';
          },
          min: 0
        },
        width: wx.getStorageSync('systemInfo').screenWidth,
        height: 250,
        dataLabel: true
      })
    } else if(options.id == 'click'){
      that.setData({ 
        data_name: '了解我的',
        data_x: wx.getStorageSync('chartData').click_data.seven_day.x,
        data_y: wx.getStorageSync('chartData').click_data.seven_day.y,
        width: wx.getStorageSync('systemInfo').screenWidth,
        parameter: 'setClickHeatmapData',
        canIsee: true
      })
      wx.setNavigationBarTitle({
        title: '了解我的',
      })
      chart = new wxCharts({
        canvasId: 'lineCanvas',
        type: 'line',
        // extra: {
        //   lineStyle: 'curve'
        // },
        categories: that.data.data_x,
        series: [{
          name: '日期',
          data: that.data.data_y,
        }],
        yAxis: {
          // title: '分享次数',
          format: function (val) {
            return val + '次';
          },
          min: 0
        },
        width: wx.getStorageSync('systemInfo').screenWidth,
        height: 250,
        dataLabel: true
      })
    }
  },

  onResize: function (res) {
    var that = this;
    this.setData({
      width: res.size.screenWidth,
      height: 250,
      days: 1
    })
    let resize_name = this.data.data_name;
    setTimeout(function () {
      if (resize_name == '看见我的') {
        let kanS = wx.getStorageSync('chartData').exposure_data.seven_day
        that.Datacategory(kanS)
      } else if (resize_name == '传播我的') {
        let barS = wx.getStorageSync('chartData').share_data.seven_day
        that.Datacategory(barS)
      } else if (resize_name == '了解我的') {
        let shareS = wx.getStorageSync('chartData').click_data.seven_day
        that.Datacategory(shareS)
      }
    }, 300)
  },

  seven() {
    var that = this;
    this.setData({
      days: 1,
    })
    if (this.data.data_name == '看见我的') {
      let kanS = wx.getStorageSync('chartData').exposure_data.seven_day
      that.Datacategory(kanS)
    } else if (this.data.data_name == '传播我的'){
      let barS = wx.getStorageSync('chartData').share_data.seven_day
      that.Datacategory(barS)
    } else if (this.data.data_name == '了解我的'){
      let shareS = wx.getStorageSync('chartData').click_data.seven_day
      that.Datacategory(shareS)
    }
  },

  thirty() {
    var that= this;
    if (that.data.width == wx.getStorageSync('systemInfo').screenWidth){
      wx.showToast({
        title: '30天数据建议横屏查看',
        icon: 'none',
        duration: 2000
      })
    }
    this.setData({
      days: 2
    })
    if (this.data.data_name == '看见我的') {
      let kanT = wx.getStorageSync('chartData').exposure_data.thirty_day
      that.Datacategory(kanT)
    } else if (this.data.data_name == '传播我的') {
      let barT = wx.getStorageSync('chartData').share_data.thirty_day
      that.Datacategory(barT)
    } else if (this.data.data_name == '了解我的') {
      let shareT = wx.getStorageSync('chartData').click_data.thirty_day
      that.Datacategory(shareT)
    }
  },

  ninety() {
    var that = this;
    this.setData({
      days: 3
    })
    if (this.data.data_name == '看见我的') {
      let kanN = wx.getStorageSync('chartData').exposure_data.ninety_day
      that.Datacategory(kanN)
    } else if (this.data.data_name == '传播我的') {
      let kanT = wx.getStorageSync('chartData').share_data.ninety_day
      that.Datacategory(kanT)
    } else if (this.data.data_name == '了解我的') {
      let shareT = wx.getStorageSync('chartData').click_data.ninety_day
      that.Datacategory(shareT)
    }
  },

  Datacategory:function(way){
    var that = this;
    that.setData({
      data_x: way.x,
      data_y: way.y
    })
    chart = new wxCharts({
      canvasId: 'lineCanvas',
      type: 'line',
      // extra: {
      //   lineStyle: 'curve'
      // },
      // categories: wx.getStorageSync('chartData').click_data.seven_day.x,
      categories: way.x,
      series: [{
        name: '日期',
        data: way.y,
        // format: function (val) {
        //   return val + '次';
        // }
      }],
      yAxis: {
        // title: '成交金额 (万元)',
        format: function (val) {
          return val + '次';
        },
        min: 0
      },
      // enableScroll: true,
      width: that.data.width,
      height: that.data.height,
      dataLabel: true,
    })
  },

  // 跳转热力图
  distribution() {
    let id = wx.getStorageSync('qrop').id;
    let shopLocation = wx.getStorageSync('shopCenter');
    wx.navigateTo({
      url: '../map/map?id=' + id + '&sort=' + this.data.parameter + '&latitude=' + shopLocation.latitude + '&longitude=' + shopLocation.longitude,
    })
  },

  touchstart (e) {
    chart.scrollStart(e);
  },

  scroll (e) {
    chart.scroll(e);
  },
  
  touchend (e) {
    chart.scrollEnd(e);
  }
})