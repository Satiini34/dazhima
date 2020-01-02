Component({
  properties: {
    text: {
      type: String,
      value: '你的位置信息将用于推荐附近商家'
    },
    cancelTxt: {
      type: String,
      value: '拒绝'
    },
    confirmTxt: {
      type: String,
      value: '授权'
    },
    locationShow: {
      type: Boolean,
      value: false
    }
  },

  data: {
    locationShow: false,
    refreshMainList: false
  },

  ready (){
    if (wx.getStorageSync('locationTip') == '' && wx.getStorageSync('nowCity') == 'refuse') this.setData({ locationShow: true })
  },

  // attached () {
  //   console.log('attached')
  // },

  methods: {
    cancel () {
      wx.setStorageSync('locationTip', 'showed')
      this.setData({ locationShow: false })
      this.triggerEvent('okEvent', 'show')
    },

    confirm () {
      var that = this;
      wx.openSetting({
        success(res) {
          if (res.authSetting['scope.userLocation'] == undefined) {
            wx.setStorageSync('leftHand', true)
            that.triggerEvent('okEvent', 'show')
          }
          if (res.authSetting['scope.userLocation'] == true) {
            wx.getLocation({
              type: 'gcj02',
              success(res) {
                wx.setStorageSync('userLocation', res)
              }
            })
            wx.setStorageSync('refreshMainList', true)
            that.setData({ locationShow: false })
            wx.setStorageSync('locationTip', 'showed')
            that.triggerEvent('okEvent', 'show')
          } 
        }
      })
    }
  },

  pageLifetimes: {
    show() {
      
    } 
  }
})