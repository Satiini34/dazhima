Page({
  data: {
    picShow: false,
    contentShow: false,
    goodsList: [],
    is_use: '',
    overdue: 0
  },

  onLoad: function (options) {
    var that = this;
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/orderList',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id
      },
      success: function (res) {
        if(res.data.data.length == 0){
          that.setData({
            picShow: true,
            contentShow: false
          })
        }else {
          for (let k = 0; k < res.data.data.length; k++) {
            if (res.data.data[k].is_use == 0) {
              res.data.data[k].is_use = '未使用'
            } else if (res.data.data[k].is_use == 1) {
              switch (res.data.data[k].is_evaluate) {
                case 0: 
                  res.data.data[k].is_use = '评价赢芝麻粒'
                  break;
                case 1: 
                  res.data.data[k].is_use = '待审核'
                  break;
                case 2: 
                  res.data.data[k].is_use = '已返现' + (res.data.data[k].total_amount * 10).toFixed(0) + '芝麻粒'
                  break;
                case 3: 
                  res.data.data[k].is_use = '审核未通过请重新上传'
                  break;
              }
            } else if (res.data.data[k].is_use == '2') {
              res.data.data[k].is_use = '已过期'
            }
          }
          setTimeout(function(){
            that.setData({
              picShow: false,
              contentShow: true,
              goodsList: res.data.data
            })
          },150)
        }
      }
    })
  },

  // 跳转砍价订单页
  kanOrder: function (e) {
    wx.navigateTo({
      url: '../kanOrder/kanOrder?id=' + e.currentTarget.id,
    })
  },

  //跳转评价页
  toWin (e) {
    wx.navigateTo({
      url: '../earnZhima/earnZhima?id=' + e.currentTarget.id,
    })
  },
})