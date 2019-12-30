const wxCharts = require('../../utils/wxcharts-min.js');
let chart = null;
Page({
  onLoad (options) {
    var that = this;
    let saleChart = wx.getStorageSync('saleChart');
    let enableScroll = false;
    let x, y, tip;
    switch (options.url) {
      case 'saleDay' :
        x = saleChart.day.x;
        y = saleChart.day.sale_total;
        enableScroll = true;
        tip = '元';
        that.Datacategory(x, y, enableScroll, tip);
        wx.setNavigationBarTitle({
          title: '日销售额',
        })
        break
      case 'saleWeek' : 
        x = saleChart.week.x;
        y = saleChart.week.sale_total;
        enableScroll = false;
        tip = '元';
        that.Datacategory(x, y, enableScroll, tip);
        wx.setNavigationBarTitle({
          title: '周销售额',
        })
        break
      case 'saleMonth':
        x = saleChart.month.x;
        y = saleChart.month.sale_total;
        enableScroll = false;
        tip = '元';
        that.Datacategory(x, y, enableScroll, tip);
        wx.setNavigationBarTitle({
          title: '月销售额',
        })
        break
      case 'amountDay':
        x = saleChart.day.x;
        y = saleChart.day.sale_num;
        enableScroll = true;
        tip = '单';
        that.Datacategory(x, y, enableScroll, tip);
        wx.setNavigationBarTitle({
          title: '日销售量',
        })
        break
      case 'amountWeek':
        x = saleChart.week.x;
        y = saleChart.week.sale_num;
        enableScroll = false;
        tip = '单';
        that.Datacategory(x, y, enableScroll, tip);
        wx.setNavigationBarTitle({
          title: '周销售量',
        })
        break
      case 'amountMonth':
        x = saleChart.month.x;
        y = saleChart.month.sale_num;
        enableScroll = false;
        tip = '单';
        that.Datacategory(x, y, enableScroll, tip);
        wx.setNavigationBarTitle({
          title: '月销售量',
        })
        break
    }
    // chart = new wxCharts({
    //   canvasId: 'lineCanvas',
    //   type: 'line',
    //   categories: x,
    //   series: [{
    //     name: '日期',
    //     data: y,
    //   }],
    //   yAxis: {
    //     format: function (val) {
    //       return val + tip;
    //     },
    //     min: 0
    //   },
    //   width: wx.getStorageSync('systemInfo').screenWidth,
    //   height: 350,
    //   dataLabel: true,
    //   enableScroll: enableScroll
    // })
  },

  Datacategory: function (x, y, enableScroll, tip) {
    var that = this;
    chart = new wxCharts({
      canvasId: 'lineCanvas',
      type: 'line',
      categories: x,
      series: [{
        name: '日期',
        data: y,
      }],
      xAxis: {
        fontColor : '#333'
      },  
      yAxis: {
        format: function (val) {
          return val + tip;
        },
        min: 0
      },
      enableScroll: enableScroll,
      width: wx.getStorageSync('systemInfo').screenWidth,
      height: 350,
      dataLabel: true,
      dataPointShape: "circle",
    })
  },

  touchstart(e) {
    chart.scrollStart(e);
  },

  scroll(e) {
    chart.scroll(e);
  },

  touchend(e) {
    chart.scrollEnd(e);
  }
})