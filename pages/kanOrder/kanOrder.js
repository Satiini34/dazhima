Page({
  data: {
    contentShow: true,
    item:'',
    orderNo: '',
    commentStatus: '',
    commentStatusShow: ''
  },

  onLoad: function (options) {
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    });
    // 模板进入
    if(options.orderNo != undefined){
      that.setData({
        orderNo: options.orderNo
      })
      that.Order();
    }else {
      that.setData({
        orderNo: options.id
      })
      that.Order();
    }
  },

  // 扫码
  scan () {
    var that = this;
    wx.scanCode({
      onlyFromCamera: true,
      success(res) {
        let check_message = res.path.split('=')[1]
        let check_id = wx.getStorageSync('qrop').id
        wx.request({
          url: 'https://kanjia.bigclient.cn/api/api/checkByScan',
          method: 'POST',
          data: {
            user_id: check_id,
            shop_id: check_message
          },
          success (res) {
            if(res.data.code == 0){
              wx.showToast({
                title: '核销成功',
              })
              let pages = getCurrentPages();
              let prepage = pages[pages.length - 2];
              prepage.setData({
                'is_use': '已使用',
                'overdue': 1
              })
              setTimeout(function(){
                wx.showLoading();
                that.Order();
              },600)
            } 
            else {
              wx.showToast({
                title: res.data.msg,
                icon: 'none',
                duration: 2000
              })
            }
          },
          fail () {

          }
        })
      }
    })
  },

  //跳转评价页
  toWin() {
    wx.navigateTo({
      url: '../earnZhima/earnZhima?id=' + this.data.item.orderNo,
    })
  },

  Order () {
    var that = this;
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/orderDetail',
      method: 'POST',
      data: {
        orderNo: that.data.orderNo
      },
      success: function (res) {
        res.data.data.is_use == 1 ? that.setData({ commentStatusShow: true }) : that.setData({ commentStatusShow: false })
        res.data.data.expire_day = res.data.data.expire_day.slice(0, 10);
        switch (res.data.data.is_evaluate){
          case 0: 
            that.setData({
              commentStatus: '立即申请'
            })
            break;
          case 1: 
            that.setData({
              commentStatus: '待审核'
            })
            break;
          case 2:
            that.setData({
              commentStatus: '已返现' + (res.data.data.total_amount * 10).toFixed(0) + '芝麻粒'
            })
            break;
          case 3:
            that.setData({
              commentStatus: '审核未通过，请重新上传'
            })
            break;
        }
        //新评分机制
        let shopScore1 = res.data.data.shop_score;
        if (shopScore1 < 1.25) {
          that.setData({
            heart: 1
          })
        } else if (shopScore1 >= 1.25 && shopScore1 < 1.75) {
          that.setData({
            heart: 1.5
          })
        } else if (shopScore1 >= 1.75 && shopScore1 < 2.25) {
          that.setData({
            heart: 2
          })
        } else if (shopScore1 >= 2.25 && shopScore1 < 2.75) {
          that.setData({
            heart: 2.5
          })
        } else if (shopScore1 >= 2.75 && shopScore1 < 3.25) {
          that.setData({
            heart: 3
          })
        } else if (shopScore1 >= 3.25 && shopScore1 < 3.75) {
          that.setData({
            heart: 3.5
          })
        } else if (shopScore1 >= 3.75 && shopScore1 < 4.25) {
          that.setData({
            heart: 4
          })
        } else if (shopScore1 >= 4.25 && shopScore1 < 4.75) {
          that.setData({
            heart: 4.5
          })
        } else if (shopScore1 >= 4.75) {
          that.setData({
            heart: 5
          })
        }
        res.data.data.shop_address.length > 24 ? res.data.data.shop_address = res.data.data.shop_address.slice(0, 23) + '…' : res.data.data.shop_address = res.data.data.shop_address;
        that.setData({
          item: res.data.data,
        })
        setTimeout(function(){
          wx.hideLoading();
        },100)
      },
      fail () {

      }
    })
  },

  //商家定位
  shopAddress: function () {
    let name = this.data.item.shop_name;
    let latitude = parseFloat(this.data.item.latitude);
    let longitude = parseFloat(this.data.item.longitude);
    wx.openLocation({
      name,
      latitude,
      longitude,
      scale: 16
    })
  },

  //拨号
  shopTel: function () {
    var shopPhone = this.data.item.shop_mobile.split('；')[0];
    wx.makePhoneCall({
      phoneNumber: shopPhone
    })
  },
})