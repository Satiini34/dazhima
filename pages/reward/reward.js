const app = getApp();
var time = require('../../utils/util.js');
let timer;
Page({
  data: {
    rewardList:[],
    trendsData:[],
    animationData: '',
    y: 0,
    friends:'',
    reward:'',
    qrImg:null,
    qrCode:null,
    qr:null,
    faceClose:false,
    watchMore:false,
    bright:null,
    sharePoster:'',
    trends_info: '',
    no_reword: false,
    have_reword: false,
    hasDanmu: false,
    posterShow: false,
    scopePhoto: true,
    bonus: ''
  },

  onLoad: function (options) {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/myInviterInfo',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id
      },
      success: function (res) {
        wx.hideLoading();
        res.data.data.bullet.length == 0 ? that.setData({ hasDanmu: false }) : that.setData({ hasDanmu: true })
        that.setData({
          trendsData: res.data.data.bullet,
          trends_info: res.data.data.bullet[0],
          bonus: res.data.data.bonus
        })
        res.data.data.inviter_info.map( e => {
          e.inviter_time = time.tsFormatTime(e.inviter_time * 1000, 'Y-M-D h:m')
        })
        if (res.data.data.inviter_info.length != 0) {
          if (res.data.data.inviter_info.length > 5) {
            let reward_top = res.data.data.inviter_info.slice(0, 5);
              that.setData({
                watchMore: true,
                rewardList: reward_top,
                have_reword: true
              })
            wx.setStorageSync('referee_list', res.data.data.inviter_info);
          } else {
            that.setData({
              rewardList: res.data.data.inviter_info,
            })
            that.setData({
              friends: res.data.data.inviter_info.length,
              have_reword: true,
              no_reword: false
            })
          }
        }else {
          that.setData({
            have_reword: false,
            no_reword: true
          })
        }
      },
      fail: function () {
        wx.showToast({
          title: '网络繁忙请重试!',
          mask: true,
          duration: 1500,
          icon: 'none'
        })
      }
    })
    
    //朋友圈分享图
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/setRewardPic',
      method:'POST',
      data:{
        user_id: wx.getStorageSync('qrop').id,
      },  
      success:(res)=>{
        that.setData({
          sharePoster: res.data.data
        })
      }
    })

    //弹幕滚动
    let j = 0;
    timer = setInterval(function () {
      j++
      if (j == that.data.trendsData.length) {
        j = 0;
      }
      that.setData({
        trends_info: that.data.trendsData[j]
      })
    }, 6000)
  },

  watchMore:function(){
   this.setData({
     rewardList: wx.getStorageSync('referee_list'),
     watchMore: false
   })
  },

  earnMoney: function () {
    this.setData({
      posterShow: true,
    })
  },

  sharePoster () {
    this.setData({ posterShow:true })
  },

  faceClose: function () {
    this.setData({
      posterShow: false
    })
  },

  //分享朋友圈保存
  posterToPhone: function () {
    var that = this;
    wx.showLoading({
      title: '保存中',
      mask: true
    })
    if (that.data.scopePhoto == false) {
      wx.openSetting({
        success(res) {
          if (res.authSetting['scope.writePhotosAlbum'] == true) {
            that.setData({
              scopePhoto: true
            })
          }
        }
      })
      that.setData({ posterShow: false })
      wx.hideLoading();
    } else {
      wx.downloadFile({
        url: 'https://kanjia.bigclient.cn' + that.data.sharePoster,   //图片地址
        success: function (res) {
          if (res.statusCode === 200) {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success(res) {
                wx.hideLoading();
                wx.showToast({
                  title: '保存成功！',
                  success: (res) => {
                    that.setData({
                      posterShow: false
                    })
                  }
                })
              },
              fail(xhr) {
                wx.getSetting({
                  success(res) {
                    if (res.authSetting['scope.writePhotosAlbum'] == false) {
                      that.setData({
                        scopePhoto: false,
                      })
                    }
                  }
                })
                wx.showToast({
                  title: '保存图片失败！',
                  icon: 'none'
                })
              }
            })
          }
        }
      })
    }
  },

  onReady: function () {
    wx.hideShareMenu();
  },

  onUnload () {
    clearInterval(timer)
  },

  onShareAppMessage: function () {
    var that = this;
    let reward_imgUrl = 'http://kanjia.bigclient.cn/upload/reward2.png'
    return {
      title: '你与美食，只差一刀',
      path: 'pages/index/index?reward_id=' + wx.getStorageSync('qrop').id,
      imageUrl: 'https://kanjia.bigclient.cn/upload/reward8.jpg'
    }
  }
})