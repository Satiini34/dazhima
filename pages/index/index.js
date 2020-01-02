const app = getApp();
const RSA = require('../../utils/wx_rsa.min.js');
const time = require('../../utils/util.js');
let nowScrollTop = 0;
let currentPriceShare = '';
Page({
  data: {
    goodsList: [],
    locationShow: false,
    shareShow: false,
    goods_id: '',
    versionBelow: false,
    menuRectTop: '',
    doubleMenuRectTop: '',
    getUserLocation: 2,
    userLogin: false,
    clickId: '',
    posterShow: false,
    sharePoster: '',
    scopePhoto: true,
    isBottom: false,
    good_price_share: '',
    backToShare: false,
    goodItem_sort: '',
    x: '620rpx',
    y: '18rpx',
    isLoaded: false,
    bannerimgUrls: [
      'reward6.png'
    ],
    page: 1,
    allGoodDetail: '',
    releaseState: true,
    pop: '',
    popShow: false,
    popShowDelay: false,
    locationTip: false
  },

  testBargin () {
    this.setData({
      current_price: parseInt(1)
    })
  },

  onLoad: function (options) {
    var that = this;
    // 显示城市信息
    let tencentMapKey = 'JAXBZ-ZVACX-OGN46-7DUJS-7UO2J-QWBYE';
    let latitude = wx.getStorageSync('userLocation').latitude;
    let longitude = wx.getStorageSync('userLocation').longitude;
    wx.request({
      url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${tencentMapKey}`,
      success(res) {
        if(res.data.status == 0){
          wx.setStorageSync('nowCity', res.data.result.ad_info.city)
        }
      }
    })
    //扫小程序码进
    if (options.scene != undefined) {
      let sharePosterQr = options.scene;
      // 扫优惠券二维码
      let reg_c = /coupon\d+/g;
      if (reg_c.test(sharePosterQr) == true) {
        let couponId = sharePosterQr.replace("coupon", "");
        wx.navigateTo({
          url: `../coupon/coupon?id=${couponId}`,
        })
      }
      if (sharePosterQr.length >= 15){
        // 自动拼接当天日期
        let scan_share_id = sharePosterQr.substr(14, sharePosterQr.length - 1)
        let scan_goods_id = sharePosterQr.substr(0, 14);
        let scan_goods_id_istoday = scan_goods_id.slice(6, 14);
        let scan_truly_id,scan_concat_id;
        let scanToday = time.tsFormatTime(new Date(), 'YMD');
        scan_concat_id = scan_goods_id.slice(0, 6).concat(scanToday)
        scan_goods_id_istoday == scanToday ? scan_truly_id = scan_goods_id : scan_truly_id = scan_concat_id;
        that.setData({
          goods_id: scan_truly_id,
          goods_id_share: scan_truly_id,
          share_id: scan_share_id
        })
        wx.navigateTo({
          url: '../share/share?share_id=' + scan_share_id + '&goods_id=' + scan_truly_id
        })
      }else if (sharePosterQr.length == 5){
        console.log(sharePosterQr)
        that.ScanResult(sharePosterQr)
      }else {
        let reg = /uid\d+/g;
        let scanUid = options.scene;
        if (reg.test(scanUid) == true) {
          let inviterUid = scanUid.replace("uid", "");
          wx.setStorageSync('inviterId', inviterUid);
          that.setData({
            share_id: inviterUid
          }) 
        }
      }
    }

    if(options.share_id && options.goods_id != undefined){
      let goods_id_basic = options.goods_id.slice(0, 6);
      let shareToday = time.tsFormatTime(new Date(), 'YMD');
      let new_goods_id = goods_id_basic.concat(shareToday);
      wx.setStorageSync('inviterId', options.share_id);
      wx.navigateTo({
        url: '../share/share?share_id=' + options.share_id + '&goods_id=' + new_goods_id
      })
    }

    // 直接首頁轉發 
    if (options.share_id != undefined) wx.setStorageSync('inviterId', options.share_id);
    
    // 推荐奖励页分享好友
    if (options.reward_id != undefined){
      that.setData({ share_id: options.reward_id })
      wx.setStorageSync('inviterId', options.reward_id)
    }

    //获取版本信息
    let user_version = wx.getStorageSync('systemInfo').version.slice(0, 1);
    if (user_version >= 7) {
        that.setData({
          versionBelow: true
        })
    } else {
      that.setData({
        versionBelow: false
      })
    }

    const menuRect = wx.getMenuButtonBoundingClientRect();
    this.setData({
      menuRectTop: menuRect.top,
      doubleMenuRectTop: menuRect.top * 2
    })

    // 距离显示
    if(wx.getStorageSync('userLocation') != ''){
      that.setData({
        locationShow: true,
        getUserLocation: 1
      })
    }else {
      that.setData({
        locationShow: false,
        // getUserLocation: 3
      })
    }

    // 用户首次进入首页未加载数据屏幕空白(手机拒绝授权微信GPS信息未知是否会走getLocation的sueccess或fail事件???)
    if (wx.getStorageSync('nowCity') == '') {
      that.Dailygoodlist();
    } 
    
    //地理位置授权
    wx.getLocation({
      type: 'gcj02',
      success (res) { 
        wx.setStorageSync('userLocation', res)
        // 显示城市信息
        let tencentMapKey = 'JAXBZ-ZVACX-OGN46-7DUJS-7UO2J-QWBYE';
        let latitude = res.latitude;
        let longitude = res.longitude;
        wx.request({
          url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${tencentMapKey}`,
          success(res) {
            if (res.data.status == 0) {
              wx.setStorageSync('nowCity', res.data.result.ad_info.city)
              that.setData({
                popShowDelay: true
              })
            }
          }
        })
        that.DailygoodlistBak();
        setTimeout( () => {
          that.setData({
            getUserLocation: 1,
            locationShow: true
          })
        },250)
      },
      fail () {
        if (wx.getStorageSync('locationTip') == ''){
          that.setData({
            locationTip: true
          })
        }
        that.setData({
          getUserLocation: 3,
          locationShow: false,
        })
        wx.setStorageSync('nowCity', 'refuse')
        that.Dailygoodlist();
      }
    })

    // 是否有审核不通过的订单
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/getEvaluateNotice',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id,
      },
      success (res) {
        if(res.data == 1) {
          wx.showTabBarRedDot({ index: 2 })
          wx.setStorage({
            key: 'redDot',
            data: true,
          })
        }else {
          wx.hideTabBarRedDot({ index: 2 })
        }
      }
    })

    // 弹窗顺序
    if(wx.getStorageSync('locationTip') == 'showed') that.setData({ popShowDelay: true })

    // banner图
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/bannerList2',
      method: 'POST',
      success (res) {
        if(res.data.code == 0){
          if(res.data.data != ''){
            that.setData({
              bannerimgUrls: res.data.data.concat(that.data.bannerimgUrls)
            })
          }
          if(res.data.pop != ''){
            that.setData({ pop: res.data.pop })
            let closeTime = Date.parse(new Date);
            if (wx.getStorageSync('popShow') == '' || wx.getStorageSync('popShow') < closeTime) {
              that.setData({
                popShow: true
              })
            } else {
              that.setData({
                popShow: false
              })
            }
          }
        }
      }
    })
  },

  // 活动弹窗
  Recordsign() {
    this.setData({
      popShow: false
    })
    let x = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1);
    let y = Date.parse(x);
    wx.setStorageSync('popShow', y)
  },

  popImg (e) {
    console.log(e)
  },

  closePop () {
    this.Recordsign();
  },

  getLocation() {
    var that = this;
    wx.openSetting({
      success(res) {
        if (res.authSetting['scope.userLocation'] == undefined) {
          wx.setStorageSync('leftHand', true)
        }
        if (res.authSetting['scope.userLocation'] == true) {
          wx.getLocation({
            type: 'gcj02',
            success (res) {
              wx.setStorageSync('userLocation', res)
              that.setData({
                getUserLocation: 1,
                locationShow: true,
                locationTip: false
              })
              that.DailygoodlistBak()
              let tencentMapKey = 'JAXBZ-ZVACX-OGN46-7DUJS-7UO2J-QWBYE';
              let latitude = res.latitude;
              let longitude = res.longitude;
              wx.request({
                url: `https://apis.map.qq.com/ws/geocoder/v1/?location=${latitude},${longitude}&key=${tencentMapKey}`,
                success(res) {
                  if (res.data.status == 0) {
                    wx.setStorageSync('nowCity', res.data.result.ad_info.city)
                  }
                }
              })
            }
          })
        }
      }
    })
  },

  okEvent () {
    this.setData({
      popShowDelay: true,
      locationTip: false
    })
  },

  //跳转详情页
  goodItem (e) {
    var that = this;
    let goods_navigate = e.currentTarget.id.slice(0, 6);
    let goods_navigateToday = time.tsFormatTime(new Date(), 'YMD');
    let goods_navigateSplice = goods_navigate.concat(goods_navigateToday);
    for (let k = 0; k < that.data.goodsList.length; k++){
      if (that.data.goodsList[k].id == e.currentTarget.id) {
        // 浏览量+1
        that.data.goodsList[k].click_num = parseInt(that.data.goodsList[k].click_num) + 1;
        setTimeout(()=> {
          that.setData({ goodsList: that.data.goodsList })
        },600)
      }
    }
    wx.navigateTo({
      url: '../goodItem/goodItem?good_id=' + goods_navigateSplice,
    })
  },

  // 砍价
  bargin (e){
    var that = this;
    let good_id = e.target.id;
    let share_goods = e.currentTarget.dataset.img.split(',')[0];
    let good_price_share = e.currentTarget.dataset.price;
    currentPriceShare = e.currentTarget.dataset.nowprice;
    this.setData({
      goods_id: good_id,
      goods_pic: share_goods,
      good_price_share,
      allGoodDetail: e.target.dataset.all
    })
    let type;
    wx.getStorageSync('userLocation') != '' ? type = 1 : type = 0;
    // RSA加密
    let newStr = {
      user_id: wx.getStorageSync('qrop').id,
      goods_id: good_id,
      latitude: wx.getStorageSync('userLocation').latitude,
      longitude: wx.getStorageSync('userLocation').longitude,
      share_id: '',
      type,
      come_from: wx.getStorageSync('nowCity')
    };
    let newStr1 = JSON.stringify(newStr);
    //rsa加密
    var key = app.globalData.rsaKey;
    let encrypt_rsa = new RSA.RSAKey();
    encrypt_rsa = RSA.KEYUTIL.getKey(key);
    let encStr = encrypt_rsa.encrypt(newStr1);
    encStr = RSA.hex2b64(encStr);
    that.Bargain(encStr, good_id);
    // if (e.currentTarget.dataset.all.button == '砍价') {
    //   let closeTime = Date.parse(new Date);
    //   if (wx.getStorageSync('fromID') == '' || wx.getStorageSync('fromID') < closeTime) {
    //     let x = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1);
    //     let y = Date.parse(x);
    //     wx.requestSubscribeMessage({
    //       tmplIds: ['AZ2nuVrm8yt4KTZ7pvTKX87u2mlBmshPSnyC08SkwuI'],
    //       success (res) {
    //         if (res.AZ2nuVrm8yt4KTZ7pvTKX87u2mlBmshPSnyC08SkwuI === 'accept') {
    //           wx.setStorage({
    //             key: 'fromID',
    //             data: y,
    //           })
    //         } else {
    //           wx.setStorageSync('formReject', parseInt(wx.getStorageSync('formReject') + 1))
    //           if(wx.getStorageSync('formReject') == 2) {
    //             wx.setStorage({
    //               key: 'fromID',
    //               data: y,
    //             })
    //             wx.setStorage({
    //               key: 'formReject',
    //               data: 0,
    //             })
    //           }
    //         }
    //       },
    //       complete (res) {
    //         that.Bargain(encStr, good_id);
    //       }
    //     })
    //   } else {
    //     that.Bargain(encStr, good_id);
    //   }
    // } else {
    //   that.Bargain(encStr, good_id);
    // }
  },

  Bargain (n ,id) {
    var that = this;
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/bargainList',
      method: 'POST',
      data: {
        encrypted_data: n
      },
      success: function (res) {
        if (res.data.code == 0) {
          // that.Dailygoodlist();
          that.setData({
            clickId: id,
            bargainPrice: res.data.data.bargain + '元'
          })
          setTimeout(function () {
            that.setData({
              clickId: '',
            })
          }, 1200)
          that.data.goodsList.map(e => {
            if (e.id == id) {
              // 砍价+1
              e.bargain_num = parseInt(e.bargain_num) + 1;
              e.current_price = res.data.data.current_price;
              if (e.button == '砍价') {
                e.button = '继续砍'
              } else {
                if (/^砍[\d]+次$/.test(e.button) == true) {
                  let remain_time = parseInt(e.button.slice(1, e.button.length - 1)) - 1;
                  remain_time == '0' ? e.button = '继续砍' : e.button = '砍' + remain_time.toString() + '次';
                }
              }
              that.setData({
                goodsList: that.data.goodsList
              })
            }
          })
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
        } else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none'
          })
        }
      }
    })
  },

  close_share_popup () {
    this.Saveshare();
    this.setData({
      shareShow: false,
    })
  },

  // formId
  codeSubmit (e){
    time.GetformId(e.detail.formId)
  },

  onShow () {
    var that = this;
    if (wx.getStorageSync('leftHand') == true) {
      wx.getLocation({
        type: 'gcj02',
        success(res) {
          wx.setStorageSync('userLocation', res)
          that.setData({
            getUserLocation: 1,
            locationShow: true,
            popShowDelay: true
          })
          that.DailygoodlistBak();
          that.setData({ locationTip: false })
        },
        fail () {
          // wx.removeStorageSync('leftHand');
          if (wx.getStorageSync('locationTip') == '') that.setData({ locationTip: true })
        }
      })
    }
    // 判断新老用户(服务器端是否有数据)
    setTimeout( () => {
      wx.getStorageSync('qrop') != '' ? that.setData({ userLogin: false }) : that.setData({ userLogin: true })
    }, 599)

    // // 判断是否为分享页返回，是刷新页面数据
    // if (wx.getStorageSync('shareUnLoad') == true) {
    //   that.setData({page: 1})
    //   setTimeout(()=> {
    //     that.FirstPageData();
    //     wx.removeStorageSync('shareUnLoad');
    //   },500)
    // }

    // 组件加载授权地理位置刷新列表
    if(wx.getStorageSync('refreshMainList') == true) {
      setTimeout( ()=> {
        that.DailygoodlistBak();
        wx.removeStorageSync('refreshMainList')
      }, 1111)
    }

    // 分享页点击允许地理位置授权
    setTimeout( ()=> {
      if (wx.getStorageSync('userLocation') != '') that.setData({ locationTip: false })
    }, 500)
  },

  // 加载第一页数据
  FirstPageData () {
    var that = this;
    let type_back, dail_good_url_back;
    wx.getStorageSync('qrop') != '' ? dail_good_url_back = 'dailyGoodsList' : dail_good_url_back = 'dailyGoodsList2';
    wx.getStorageSync('userLocation') != '' ? type_back = 1 : type_back = 0;
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/' + dail_good_url_back,
      method: 'POST',
      data: {
        latitude: wx.getStorageSync('userLocation').latitude,
        longitude: wx.getStorageSync('userLocation').longitude,
        user_id: wx.getStorageSync('qrop').id,
        type: type_back,
        p: 1
      },
      success(res) {
        if (res.data.code == 0) {
          that.setData({
            goodsList: res.data.data
          })
        }
      }
    })
  },

  // 图片加载失败触发
  imgLoadErr (e) {
    this.FirstPageData();
  },

  Dailygoodlist() {
    var that = this;
    let type, dail_good_url, userId;
    if (wx.getStorageSync('qrop') != '') {
      dail_good_url = 'dailyGoodsList'
      userId = wx.getStorageSync('qrop').id;
    } else {
      dail_good_url = 'dailyGoodsList2';
      userId = ''
    }
    // wx.getStorageSync('qrop') != '' ? dail_good_url = 'dailyGoodsList' : dail_good_url = 'dailyGoodsList2',
    wx.getStorageSync('userLocation') != '' ? type = 1 : type = 0;
    let requestStartTime = (new Date()).getTime();
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/' + dail_good_url,
      method: 'POST',
      data: {
        latitude: wx.getStorageSync('userLocation').latitude,
        longitude: wx.getStorageSync('userLocation').longitude,
        user_id: userId,
        type,
        p: this.data.page
      },
      success (res) {
        if(res.data.code == 0){
          if(new Date().getTime() - requestStartTime >= 1666) wx.showToast({ title: '您的网速有些慢哦', icon: 'none' })
          if (res.data.data.length < 20) {
            setTimeout(() => {
              that.setData({
                isBottom: true,
                isLoaded: false
              })
            }, 500)
          } else {
            setTimeout(() => {
              that.setData({
                isBottom: false,
                isLoaded: true
              })
            }, 500)
          }
          that.setData({
            goodsList: that.data.goodsList.concat(res.data.data)
          })
        }
      },
      fail () {
        setTimeout( () => {
          wx.reLaunch({
            url: '../index/index',
          })
        }, 1000)
      }
    })
  },

  DailygoodlistBak() {
    var that = this;
    let dail_good_url, userId;
    if (wx.getStorageSync('qrop') != '') {
      dail_good_url = 'dailyGoodsList'
      userId = wx.getStorageSync('qrop').id;
    } else {
      dail_good_url = 'dailyGoodsList2';
      userId = ''
    }
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/' + dail_good_url,
      method: 'POST',
      data: {
        latitude: wx.getStorageSync('userLocation').latitude,
        longitude: wx.getStorageSync('userLocation').longitude,
        user_id: userId,
        type: 1,
        p: 1
      },
      success(res) {
        if (res.data.code == 0) {
          that.setData({
            isBottom: true,
            isLoaded: false
          })
          that.setData({
            goodsList: res.data.data,
            getUserLocation: 1,
            locationShow: true
          })
        }
      },
      fail() {
        setTimeout(() => {
          wx.reLaunch({
            url: '../index/index',
          })
        }, 1000)
      }
    })
  },

  savePoster () {
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
        if(res.data.code == 0){
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
    if (that.data.scopePhoto == false){
      wx.openSetting({
        success (res) {
          if (res.authSetting['scope.writePhotosAlbum'] == true) {
            that.setData({
              scopePhoto: true
            })
          }
        }
      })
      that.setData({ posterShow: false})
      wx.hideLoading();
    }else {
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
                    if(res.authSetting['scope.writePhotosAlbum'] == false){
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

  faceClose () {
    this.setData({
      posterShow: false,
    })
  },

  onHide () {
    this.setData({
      shareShow: false
    })
    this.Saveshare();
  },

  test () {
    console.log(' ')
  },

  //授权
  bindgetuserinfo (e) {
    var that = this;
    let loginIn_id = e.target.id;
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
            if(res.data.code == 0){
              that.setData({ userLogin: false })
              wx.setStorageSync('qrop', res.data.data);
              // 授权完默认砍价
              let type;
              wx.getStorageSync('userLocation') != '' ? type = 1 : type = 0;
              // RSA加密
              let newStr = {
                user_id: wx.getStorageSync('qrop').id,
                goods_id: loginIn_id,
                latitude: wx.getStorageSync('userLocation').latitude,
                longitude: wx.getStorageSync('userLocation').longitude,
                share_id: '',
                type,
                come_from: wx.getStorageSync('nowCity')
              };
              let newStr1 = JSON.stringify(newStr);
              //rsa加密
              var key = app.globalData.rsaKey;
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
                      clickId: loginIn_id,
                      bargainPrice: res.data.data.bargain + '元'
                    })
                    setTimeout( () => {
                      that.setData({
                        clickId: '',
                      })
                    }, 1500)
                    that.data.goodsList.map( e => {
                      if (e.id == loginIn_id) {
                        // 砍价+1
                        e.bargain_num = parseInt(e.bargain_num) + 1;
                        e.current_price = res.data.data.current_price;
                        if (e.button == '砍价') {
                          e.button = '继续砍'
                        } else {
                          if (/^砍[\d]+次$/.test(e.button) == true) {
                            let remain_time = parseInt(e.button.slice(1, e.button.length - 1)) - 1;
                            remain_time == '0' ? e.button = '继续砍' : e.button = '砍' + remain_time.toString() + '次';
                          }
                        }
                      }
                    })
                    that.setData({
                      goodsList: that.data.goodsList
                    })
                  }
                }
              })
              if(res.data.data.get_sesame_status == 1){
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
            }
          }
        })
      },
    })
  },

  onPullDownRefresh () {
    var that = this;
    let pullDown_menuRect = wx.getMenuButtonBoundingClientRect();
    this.setData({
      menuRectTop: pullDown_menuRect.top,
      doubleMenuRectTop: pullDown_menuRect.top * 2
    })
    this.setData({ page: 1, isBottom: false, isLoaded: true })
    // wx.showLoading({
    //   title: '刷新中',
    //   mask: true
    // })
    // setTimeout(function() {
      this.FirstPageData();
      wx.stopPullDownRefresh()
      wx.hideLoading();
    // }, 500);
  },

  onReachBottom () {
    this.setData({ page: parseInt(this.data.page) + 1 })
    setTimeout( ()=> {
      this.Dailygoodlist()
    }, 100)
  },

  share_num () {
    this.setData({ backToShare:true})
  },

  Saveshare (){
    var that = this;
    let type;
    wx.getStorageSync('userLocation') !='' ? type = 1 : type = 0; 
    if(that.data.backToShare == true){
      wx.request({
        url: 'https://kanjia.bigclient.cn/api/api/saveShareNum',
        method: 'POST',
        data: {
          user_id: wx.getStorageSync('qrop').id,
          goods_id: that.data.goods_id,
          latitude: wx.getStorageSync('userLocation').latitude,
          longitude: wx.getStorageSync('userLocation').longitude,
          type
        },
        success () {
          that.setData({ backToShare: false})
        }
      })
    }
  },

  //置顶
  beTop (e) {
    var that = this;
    let goods_id_top = e.currentTarget.id;
    let beTop_id = e.currentTarget.id.slice(0, 6); 
    for(let i=0;i<that.data.goodsList.length;i++){
      if (that.data.goodsList[i].id == goods_id_top){
        if (that.data.goodsList[i].is_top == 1) {
          that.data.goodsList[i].is_top = 0
          wx.request({
            url: 'https://kanjia.bigclient.cn/api/api/deleteTopGoods',
            method: 'POST',
            data: {
              user_id: wx.getStorageSync('qrop').id,
              goods_id: beTop_id
            },
            success (res) {
              if (res.data.code == 0) wx.showToast({ title: '已取消置顶',icon:'none'})
            }
          })
        }else {
          that.data.goodsList[i].is_top = 1
          wx.request({
            url: 'https://kanjia.bigclient.cn/api/api/addTopGoods',
            method: 'POST',
            data: {
              user_id: wx.getStorageSync('qrop').id,
              goods_id: beTop_id
            },
            success(res) {
              if (res.data.code == 0) wx.showToast({ title: '已置顶', icon: 'none' })
            }
          })
        }
      }
      that.setData({
        goodsList: that.data.goodsList
      })
    }
  },

  // 核销
  ScanResult(shopId) {
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/checkByScan',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id,
        shop_id: shopId
      },
      success(res) {
        wx.hideLoading();
        if (res.data.code == 0) {
          wx.showToast({
            title: '核销成功',
            mask: true
          })
          setTimeout(() => {
            wx.navigateTo({
              url: '../kanOrder/kanOrder?id=' + res.data.data,
            })
          }, 1000)
        }else if (res.data.code == 20018 || res.data.code == 10002 || res.data.code == 10000) {
        } else if (res.data.code == 30008 || res.data.code == 20019) {
          setTimeout(() => {
            wx.navigateTo({
              url: '../kanOrder/kanOrder?id=' + res.data.data,
            })
          }, 100)
        }else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 1000,
            mask: true
          })
        }
      },
      fail() {
        wx.showToast({
          title: '网络异常',
          icon: 'none'
        })
      }
    })
  },

  //移动区域
  moveableChange (e) {
    var that = this;
    if (e.detail.x >= 320){
      that.setData({ x: e.detail.x - 10, y: e.detail.y })
    }
    if (e.detail.y >24){
      that.setData({ y: e.detail.y - 10, x: e.detail.x })
    }
  }, 

  onPageScroll(e) {
    var that = this;
    if ( e.scrollTop - nowScrollTop >= 350 || nowScrollTop - e.scrollTop >= 350 ){
      nowScrollTop = e.scrollTop;
      that.setData({ releaseState: false })
    }
  },

  //banner跳转新手引导定死
  imageUrlFixed () {
    wx.navigateTo({
      url: '../newbie/newbie',
    })
  },

  // 正常banner跳转
  imageUrl (e) {
    this.Recordsign();
    let jumpUrl_banner = e.currentTarget.dataset.url;
    let patt1 = new RegExp("dailyGoodsDetail");
    let patt2 = new RegExp("articleDetail");
    let patt3 = new RegExp("getActivityInfo")
    if (patt1.test(jumpUrl_banner) == true){
      let banner_good_id = jumpUrl_banner.split('=')[1].slice(0, 6);
      let banner_navigateToday = time.tsFormatTime(new Date(), 'YMD');
      let banner_Jumpgood_id = banner_good_id.concat(banner_navigateToday);
      wx.navigateTo({
        url: '../goodItem/goodItem?good_id=' + banner_Jumpgood_id,
      })
    } else if (patt2.test(jumpUrl_banner) == true){
      let banner_artical_id = jumpUrl_banner.split('=')[1];
      wx.navigateTo({
        url: '../zhimajiDetail/zhimajiDetail?id=' + banner_artical_id,
      })
    } else if (patt3.test(jumpUrl_banner) == true){
      wx.navigateTo({
        url: '../activity/activity'
      })
    }
  }, 

  toRelease () {
    var that = this;
    if (this.data.releaseState == false ){
      that.setData({ releaseState: true })
    }else {
      wx.navigateTo({
        url: '../zhimaji/zhimaji',
      })
    }
  },

  newBeeToLook() {
    wx.navigateTo({
      url: '../mission/mission',
    })
    this.setData({ newCustomer: false })
  },

  onShareAppMessage (res) {
    console.log(res)
    let shared_id = wx.getStorageSync('qrop').id;
    if (res.from === 'button') {
      let share_imgUrl = 'http://new-bigclient.oss-cn-qingdao.aliyuncs.com' + res.target.dataset.share.goods_pic;
      return {
        title: `原价¥${res.target.dataset.share.price},现在只要¥${res.target.dataset.share.current_price},快来帮我一下！`,
        path: 'pages/index/index?share_id=' + shared_id + '&goods_id=' + res.target.dataset.share.id,
        imageUrl: share_imgUrl
      }
    }else if(res.from == 'menu'){
      return {
        title: '你与美食，只差一刀',
        path: 'pages/index/index?share_id=' + shared_id,
        imageUrl: 'https://kanjia.bigclient.cn/upload/reward8.jpg'
      }
    }
  }
})