const key = getApp().globalData.rsaKey;
const RSA = require('../../utils/wx_rsa.min.js');
const util = require('../../utils/util.js');
let timer;
Page({
  data: {
    goods: [],
    friends: [],
    friends_info: [],
    all_friends: [],
    goodsList: [],
    trends: [],
    userInfo: '',
    isShow: false, 
    shareShow: false,
    locationShow: false,
    goods_id_share: '',
    goods_id:'',
    share_id: '',
    trends_info: '',
    kanjiaBtn: '',
    hours: '',
    minutes: '',
    seconds: '',
    shareShow: false,
    hasDanmu: false,
    ruleShow: false,
    userLogin: false,
    ruleShow: false,
    clickId: '',
    bargainPrice: '',
    helpBargainPrice: '',
    helpClick: false,
    price_now: '',
    button_text: '',
    scopePhoto: false,
    share_type: true,
    good_price_share: '',
    loadComplete: false,
    goodItem_all: '',
    help_can_sort: '',
    page: 1,
    location
  },

  onLoad: function (options) {
    var that = this;
    wx.hideShareMenu();
    // wx.showLoading({
    //   title: '加载中',
    //   mask: true
    // })
    // 判断新老用户(服务器端是否有数据)
    wx.getStorageSync('qrop') != '' ? that.setData({ kanjiaBtn: 2, userLogin: false }) : that.setData({ kanjiaBtn: 1, userLogin: true })
    wx.setStorageSync('inviterId', options.share_id);
    let share_id = options.share_id;
    let goods_id = options.goods_id;
    // let goods_id = '10008020200101'
    this.setData({
      goods_id: goods_id,
      share_id: share_id,
      goods_id_share: goods_id
    })

    // 加载分享页数据 
    this.ShareDetail()
    //地理位置显示
    wx.getStorageSync('userLocation') != '' ? that.setData({ locationShow: true }) : that.setData({ locationShow: false })
  },

  // 获取formId
  codeSubmit:function(e){
    util.GetformId(e.detail.formId)
  },

  loadMore:function(){
    var that = this;
    that.setData({
      friends: wx.getStorageSync('friends'),
      isShow: false
    })
  },

  // others砍价
  bargin: function (e) {
    var that = this;
    let good_id = e.target.id;
    let share_goods = e.currentTarget.dataset.img.split(',')[0];
    let good_price_share = e.currentTarget.dataset.price
    this.setData({
      goods_id: good_id,
      goods_pic: share_goods,
      good_price_share,
      goodItem_all: e.target.dataset.all,
      share_type: false,
    })
    let other_type;
    wx.getStorageSync('userLocation') == '' ? other_type = 0 : other_type = 1;
    if (wx.getStorageSync('qrop') != '') {
      // RSA加密
      let newStr = {
        user_id: wx.getStorageSync('qrop').id,
        goods_id: good_id,
        latitude: wx.getStorageSync('userLocation').latitude,
        longitude: wx.getStorageSync('userLocation').longitude,
        share_id: '',
        type: other_type
      };
      let newStr1 = JSON.stringify(newStr);
      //rsa加密
      let encrypt_rsa = new RSA.RSAKey();
      encrypt_rsa = RSA.KEYUTIL.getKey(key);
      let encStr = encrypt_rsa.encrypt(newStr1);
      encStr = RSA.hex2b64(encStr);
      wx.request({
        url: 'https://kanjia.bigclient.cn/api/api/bargainList',
        method: 'POST',
        data: {
          encrypted_data: encStr
        },
        success: function (res) {
          if (res.data.code == 0) {
            that.setData({
              clickId: good_id,
              bargainPrice: res.data.data.bargain + '元'
            })
            for (let k = 0; k < that.data.goodsList.length; k++) {
              if (that.data.goodsList[k].id == that.data.goods_id) {
                that.data.goodsList[k].current_price = res.data.data.current_price;
                if (that.data.goodsList[k].button == '砍价'){
                  that.data.goodsList[k].button = '继续砍'
                } else {
                  if (/^砍[\d]+次$/.test(that.data.goodsList[k].button) == true){
                    let remain_time = parseInt(that.data.goodsList[k].button.slice(1, that.data.goodsList[k].button.length - 1)) - 1;
                    if (remain_time == '0'){
                      that.data.goodsList[k].button = '继续砍'
                    }else {
                      that.data.goodsList[k].button = '砍' + remain_time.toString() + '次'
                    }
                  }
                }
              }
            }
            that.setData({
              goodsList: that.data.goodsList
            })
            setTimeout(function(){
              that.setData({
                clickId: '',
              })
            },1500)
          } else if (res.data.code == 30001) {
            that.setData({
              shareShow: true
            })
          } else if (res.data.code == 30007) {
            wx.showToast({
              title: '该商品已抢完，下次要手快哦',
              icon: 'none',
              duration: 2000,
              mask: false
            })
          }
        }
      })
    }
  },

  //帮Ta砍价
  help_can (e){
    var that = this;
    this.setData({
      goods_id: that.data.goods_id_share,
      goods_pic: that.data.goods.goods_pic,
      helpClick: false,
      share_type: true,
      help_can_sort: e.target.dataset.sort
    })
    let help_type;
    wx.getStorageSync('userLocation') != '' ? help_type = 0 : help_type = 1;
    let newStr = {
      user_id: wx.getStorageSync('qrop').id,
      goods_id: that.data.goods_id_share,
      latitude: wx.getStorageSync('userLocation').latitude,
      longitude: wx.getStorageSync('userLocation').longitude,
      share_id: that.data.share_id,
      type: help_type,
      come_from: wx.getStorageSync('nowCity')
    };
    let newStr1 = JSON.stringify(newStr);
    //rsa加密   
    // let key = app.globalData.rsaKey;
    let encrypt_rsa = new RSA.RSAKey();
    encrypt_rsa = RSA.KEYUTIL.getKey(key);
    let encStr = encrypt_rsa.encrypt(newStr1);
    encStr = RSA.hex2b64(encStr);
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/bargainList',
      method: 'POST',
      data: {
        encrypted_data: encStr
      },
      success: function (res) {
        if (res.data.code == 0) {
          that.setData({
            helpClick: true,
            helpBargainPrice: res.data.data.bargain + '元'
          })
          setTimeout(function () {
            that.setData({
              helpClick: false,
            })
          }, 1500)
          wx.request({
            url: 'https://kanjia.bigclient.cn/api/api/shareDetail',
            method: 'POST',
            data: {
              user_id: wx.getStorageSync('qrop').id,
              goods_id: that.data.goods_id_share,
              share_id: that.data.share_id,
              longitude: wx.getStorageSync('userLocation').longitude,
              latitude: wx.getStorageSync('userLocation').latitude,
              type: help_type
            },
            success: function (res) {
              if (res.data.code == 0) {
                res.data.data.goods.goods_pic = res.data.data.goods.goods_pic.split(',')[0];
                for (let k = 0; k < res.data.data.trends.length; k++) {
                  if (res.data.data.trends[k].nickname.length >= 2) {
                    res.data.data.trends[k].nickname = res.data.data.trends[k].nickname.slice(0, 1) + '**';
                  } else {
                    res.data.data.trends[k].nickname = res.data.data.trends[k].nickname;
                  }
                }
                that.setData({
                  goods: res.data.data.goods,
                  trends: res.data.data.trends,
                  friends: res.data.data.friends
                })
              }
            }
          })
        } else if (res.data.code == 30001) {
          that.setData({
            shareShow: true
          })
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      }
    })
  },

  //授权
  bindgetuserinfo (e) {
    var that = this;
    wx.getUserInfo({
      success: res => {
        wx.setStorageSync('userInfo', JSON.parse(e.detail.rawData))
        wx.request({
          url: 'https://kanjia.bigclient.cn/api/users/decryptData',
          method: 'POST',
          data: {
            iv: res.iv,
            data: res.encryptedData,
            session_key: wx.getStorageSync('session_key').session_key,
            inviter_id: wx.getStorageSync('inviterId')
          },
          success: function (res) {
            wx.setStorageSync('qrop', res.data.data);
            if (res.data.data.get_sesame_status == 1) {
              wx.showModal({
                title: '',
                content: '恭喜获得10元无门槛红包！',
                cancelText: '确认',
                confirmText: '查看',
                success(res) {
                  if (res.confirm) wx.navigateTo({ url: '../mission/mission', })
                }
              })
            }
            that.setData({ 
              kanjiaBtn: 2,
              userLogin: false,
              userInfo: wx.getStorageSync('qrop'),
            })
            setTimeout(function(){
              let help_type;
              wx.getStorageSync('userLocation') != '' ? help_type = 0 : help_type = 1;
              let newStr = {
                user_id: wx.getStorageSync('qrop').id,
                goods_id: that.data.goods_id_share,
                latitude: wx.getStorageSync('userLocation').latitude,
                longitude: wx.getStorageSync('userLocation').longitude,
                share_id: that.data.share_id,
                type: help_type,
                come_from: wx.getStorageSync('nowCity') 
              };
              let newStr1 = JSON.stringify(newStr);
              //rsa加密
              let encrypt_rsa = new RSA.RSAKey();
              encrypt_rsa = RSA.KEYUTIL.getKey(key);
              let encStr = encrypt_rsa.encrypt(newStr1);
              encStr = RSA.hex2b64(encStr);
              wx.request({
                url: 'https://kanjia.bigclient.cn/api/api/bargainList',
                method: 'POST',
                data: {
                  encrypted_data: encStr
                },
                success (res) {
                  if (res.data.code == 0) {
                    that.setData({
                      helpClick: true,
                      helpBargainPrice: res.data.data.bargain + '元'
                    })
                    setTimeout(function () {
                      that.setData({
                        helpClick: false,
                      })
                    }, 1500)
                    wx.request({
                      url: 'https://kanjia.bigclient.cn/api/api/shareDetail',
                      method: 'POST',
                      data: {
                        user_id: wx.getStorageSync('qrop').id,
                        goods_id: that.data.goods_id_share,
                        share_id: that.data.share_id,
                        longitude: wx.getStorageSync('userLocation').longitude,
                        latitude: wx.getStorageSync('userLocation').latitude,
                        type: help_type
                      },
                      success (res) {
                        if (res.data.code == 0) {
                          res.data.data.goods.goods_pic = res.data.data.goods.goods_pic.split(',')[0];
                          for (let k = 0; k < res.data.data.trends.length; k++) {
                            if (res.data.data.trends[k].nickname.length >= 2) {
                              res.data.data.trends[k].nickname = res.data.data.trends[k].nickname.slice(0, 1) + '**';
                            } else {
                              res.data.data.trends[k].nickname = res.data.data.trends[k].nickname;
                            }
                          }
                          that.setData({
                            goods: res.data.data.goods,
                            trends: res.data.data.trends,
                          })
                        }
                      }
                    })
                  } 
                }
              })
            }, 100)
          }
        })
      }
    })
  },

  //点击主图跳转
  thisGoodItem () {
    var that = this;
    wx.navigateTo({
      url: '../goodItem/goodItem?good_id=' + that.data.goods_id_share,
    })
  },

  //跳转详情页
  goodItem (e) {
    wx.navigateTo({
      url: '../goodItem/goodItem?good_id=' + e.currentTarget.id,
    })
  },

  // 跳转购买页
  buyNow:function(){
    let pay_goods_id = this.data.goods_id;
    wx.navigateTo({
      url: '../goodItem/goodItem?good_id=' + pay_goods_id,
    })
  },

  cancel_share: function () {
    this.Saveshare();
    this.setData({
      shareShow: false
    })
  },

  close_share_popup: function () {
    this.Saveshare();
    this.setData({
      shareShow: false
    })
  },

  rule() {
    this.setData({
      ruleShow: true
    })
  },

  Saveshare: function () {
    var that = this;
    let type;
    wx.getStorageSync('userLocation') != '' ? type = 1 : type = 0;
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/saveShareNum',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id,
        goods_id: that.data.goods_id,
        latitude: wx.getStorageSync('userLocation').latitude,
        longitude: wx.getStorageSync('userLocation').longitude,
        type
      }
    })
  },

  ShareDetail() {
    var that = this;
    let share_type, shareDetail,userId;
    if (wx.getStorageSync('qrop') != ''){
      shareDetail = 'shareDetail';
      userId = wx.getStorageSync('qrop').id;
    }else {
      shareDetail = 'shareDetail2';
      userId = ''
    }
    // wx.getStorageSync('qrop') != '' ? shareDetail = 'shareDetail' : shareDetail = 'shareDetail2';
    wx.getStorageSync('userLocation') != '' ? share_type = 1 : share_type = 0;
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/' + shareDetail,
      method: 'POST',
      data: {
        user_id: userId,
        goods_id: that.data.goods_id_share,
        share_id: that.data.share_id,
        longitude: wx.getStorageSync('userLocation').longitude,
        latitude: wx.getStorageSync('userLocation').latitude,
        type: share_type,
        p: that.data.page
      },
      success (res) {
        if (res.data.code == 0) {
          res.data.data.trends.length != 0 ? that.setData({ hasDanmu: true }) : that.setData({ hasDanmu: false })
          if (res.data.data.friends.length == 0) {
            that.setData({
              hasFriend: false
            })
          } else {
            that.setData({
              hasFriend: true
            })
            wx.setStorageSync('friends', res.data.data.friends);
            if (res.data.data.friends.info.length > 3) {
              res.data.data.friends.info = res.data.data.friends.info.slice(0, 3);
              that.setData({
                isShow: true,
                friends: res.data.data.friends,
              })
            } else {
              that.setData({
                isShow: false,
                friends: res.data.data.friends,
              })
            }
          }
          res.data.data.goods.goods_pic = res.data.data.goods.goods_pic.split(',')[0];
          wx.setStorageSync('payDetail', res.data.data.goods);
          for (let k = 0; k < res.data.data.trends.length; k++) {
            if (res.data.data.trends[k].nickname.length >= 2) {
              res.data.data.trends[k].nickname = res.data.data.trends[k].nickname.slice(0, 1) + '**';
            } else {
              res.data.data.trends[k].nickname = res.data.data.trends[k].nickname;
            }
          }
          if (res.data.data.goods.button == '已结束') {
            that.setData({
              kanjiaBtn: 3
            })
          }
          that.setData({
            goods: res.data.data.goods,
            friends: res.data.data.friends,
            goodsList: that.data.goodsList.concat(res.data.data.other_goods),
            trends: res.data.data.trends,
            userInfo: wx.getStorageSync('qrop'),
            trends_info: res.data.data.trends[0]
          })
          let j = 0;
          timer = setInterval( () => {
            j++
            if (j == that.data.trends.length) {
              j = 0;
            }
            that.setData({
              trends_info: that.data.trends[j]
            })
          }, 6000)

          //倒计时
          var newSec, newMin, newHour, newDay, leftTime;
          let date = Date.parse(new Date()) / 1000;
          let timer = res.data.data.goods.end_time;
          leftTime = timer - date;
          var timer1 = setInterval(function () {
            var timerd = Math.floor(leftTime / 86400);
            var timerh = Math.floor(leftTime % 86400 / 3600);
            var timerm = Math.floor(leftTime % 3600 / 60);
            var timers = Math.floor(leftTime % 60);
            if (timers == 0 && timerm == 0 && timerh == 0 && timerd == 0) {
              clearInterval(timer1);
            }
            if (timers < 10) {
              newSec = '0' + timers;
            } else {
              newSec = timers;
            }
            if (timerm < 10) {
              newMin = '0' + timerm;
            } else {
              newMin = timerm;
            }
            if (timerh < 10) {
              newHour = '0' + timerh;
            } else {
              newHour = timerh;
            }
            leftTime--;
            if (leftTime == 0) {
              clearInterval(timer1);
            }
            that.setData({
              minutes: newMin,
              hours: newHour,
              seconds: newSec,
            })
          }, 1000);
          that.setData({ loadComplete: true })
        }else {
          wx.showToast({
            title: '网络异常请重试',
            icon: 'none'
          })
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 1500)
          wx.hideLoading();
        }
      },
      fail() {
        wx.showToast({
          title: '网络异常请重试',
          icon: 'none'
        })
        wx.hideLoading();
        setTimeout(() => {
          wx.navigateBack({
            delta: 1
          })
        }, 1500)
      }
    })
  },

  onShow () {
    wx.hideShareMenu();
  },

  onHide () {
    this.setData({
      shareShow: false
    })
  },

  onReachBottom () {
    var that = this;
    this.setData({ page: parseInt(that.data.page) + 1 })
    setTimeout( ()=> {
      let share_type_bottom, shareDetail_bottom;
      if (wx.getStorageSync('qrop') != '') {
        shareDetail_bottom = 'shareDetail';
      } else {
        shareDetail_bottom = 'shareDetail2';
      }
      wx.getStorageSync('userLocation') != '' ? share_type_bottom = 1 : share_type_bottom = 0;
      wx.request({
        url: 'https://kanjia.bigclient.cn/api/api/' + shareDetail_bottom,
        method: 'POST',
        data: {
          user_id: wx.getStorageSync('qrop').id,
          goods_id: that.data.goods_id_share,
          share_id: that.data.share_id,
          longitude: wx.getStorageSync('userLocation').longitude,
          latitude: wx.getStorageSync('userLocation').latitude,
          type: share_type_bottom,
          p: that.data.page
        },
        success(res) {
          if (res.data.code == 0) {
            for (let k = 0; k < res.data.data.other_goods.length; k++) {
              res.data.data.other_goods[k].shop_name.length > 20 ? res.data.data.other_goods[k].shop_name = res.data.data.other_goods[k].shop_name.slice(0, 19) + '…' : res.data.data.other_goods[k].shop_name = res.data.data.other_goods[k].shop_name
            }
            that.setData({
              goodsList: that.data.goodsList.concat(res.data.data.other_goods),  
            })
          }
        }
      })
    },50)
  },

  onUnload () {
    wx.setStorageSync('shareUnLoad', true);
    clearInterval(timer)
  },

  rule() {
    this.setData({ ruleShow: true })
  },

  ruleClose() {
    this.setData({ ruleShow: false })
  },

  savePoster() {
    var that = this;
    this.setData({
      shareShow: false
    })
    //朋友圈分享图
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/setSharePic',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id,
        goods_id: that.data.goods_id
      },
      success: (res) => {
        if (res.data.code == 0) {
          that.setData({
            sharePoster: res.data.data,
            posterShow: true
          })
        }
      }
    })
  },

  //分享朋友圈
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
        url: 'https://kanjia.bigclient.cn' + that.data.sharePoster,     //图片地址
        success: function (res) {
          if (res.statusCode === 200) {
            wx.saveImageToPhotosAlbum({
              filePath: res.tempFilePath,
              success(res) {
                wx.hideLoading();
                wx.showToast({
                  title: '保存图片成功！',
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

  faceClose: function () {
    this.setData({
      posterShow: false,
    })
  },

  // newBeeToLook() {
  //   wx.navigateTo({
  //     url: '../mission/mission',
  //   })
  //   this.setData({ newCustomer: false })
  // },

  test () {
    console.log('')
  },

  onShareAppMessage: function (res) {
    var that = this;
    let shared_id = wx.getStorageSync('qrop').id;
    let goods_id = this.data.goods_id;
    let share_imgUrl = 'http://new-bigclient.oss-cn-qingdao.aliyuncs.com' + this.data.goods_pic;
    let share_price, share_curPrice;
    this.data.share_type == true ? share_price = that.data.goods.price : share_price = that.data.good_price_share
    this.data.share_type == true ? share_curPrice = that.data.goods.current_price : share_curPrice = that.data.goodItem_all.current_price
    return {
      title: `原价¥${share_price}, 现在只要¥${share_curPrice }, 快来帮我一下！`,
      path: 'pages/index/index?share_id=' + shared_id + '&goods_id=' + goods_id,
      imageUrl: share_imgUrl
    }
  }
})