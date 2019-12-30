const app = getApp();
const RSA = require('../../utils/wx_rsa.min.js');
const Sesame = require('../../utils/util.js');
let options_id, daily_good_url, userId, type;
let page = 1;
let timer;
Page({
  data: {
    shareShow: false,
    goods_id: '',
    goodItemId: '',
    versionBelow: false,
    indicatorDots: true,
    autoplay: true,
    interval: 5000,
    duration: 500,
    banner:[],
    goodItem:'',
    scrollTop: 0,
    heart: 0,
    locationShow: false,
    allShow: false,
    goods_pic: '',
    canBuyNow: false,
    hasDanmu: false,
    bindMobileShow: false,
    menuRectTop: '',
    recommad_list: [],
    clickId: '',
    userLogin: false,
    posterShow: false,
    scopePhoto: false,
    good_price_share: '',
    swiperIndex: 0,
    videoShow: false,
    videoSrc: '',
    vidoePlaying: false,
    isShareBack: false,
    loadComplete: false,
    goodItem_sort: '',
    wifiAutoPlay: false,
    userPause: false,
    trends_info: [],
    addNow: false,
    backToShare: false
  },

  onPageScroll: function (e) {
    let proportion = 750 / wx.getStorageSync('systemInfo').windowWidth;
    let scrollTop = e.scrollTop * proportion;
    this.setData({
      scrollTop: scrollTop
    });
  },

  navBarCustomBack (){
    this.data.isShareBack == true ? wx.switchTab({ url: '../index/index' }) : wx.navigateBack({ delta: 1 })
  },

  //商家定位
  shopAddress () {
    let name = this.data.goodItem.shop_name;
    let latitude = parseFloat(this.data.goodItem.latitude);
    let longitude = parseFloat(this.data.goodItem.longitude);
    wx.openLocation({
      name,
      latitude,
      longitude,
      scale: 16
    })
  },

  //拨号
  shopTel () {
    var shopPhone = this.data.goodItem.shop_mobile.split('；')[0];
    wx.makePhoneCall({
      phoneNumber: shopPhone
    })
  },

  //跳转详情页
  goodItem (e) {
    let goods_navigate = e.currentTarget.id.slice(0, 6);
    let goods_navigateToday = Sesame.tsFormatTime(new Date(), 'YMD');
    let goods_navigateSplice = goods_navigate.concat(goods_navigateToday);
    wx.navigateTo({
      url: '../goodItem/goodItem?good_id=' + goods_navigateSplice,
    })
  },

  onLoad: function (options) {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    this.setData({
      goods_id: options.good_id,
      goodItemId: options.good_id
    })
    options_id = options;
    if(options.share == 'true'){
      this.setData({ isShareBack: true })
    } 
    
    //获取版本信息
    wx.getSystemInfo({
      success (res) {
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

    const menuRect = wx.getMenuButtonBoundingClientRect();
    this.setData({
      menuRectTop: menuRect.top,
      doubleMenuRectTop: menuRect.top * 2
    })
    
    wx.getStorageSync('userLocation') != '' ? that.setData({ locationShow: true }) : that.setData({ locationShow: false })
    that.ShopDetailLoadOringin(options)
  },

  ShopDetailLoadOringin(options) {
    var that = this;
    if (wx.getStorageSync('qrop') != '') {
      daily_good_url = 'dailyGoodsDetail'
      userId = wx.getStorageSync('qrop').id;
    } else {
      daily_good_url = 'dailyGoodsDetail2';
      userId = ''
    }
    wx.getStorageSync('userLocation') != '' ? type = 1 : type = 0;
    setTimeout( () => {
      wx.request({
        url: 'https://kanjia.bigclient.cn/api/api/' + daily_good_url,
        method: 'POST',
        data: {
          latitude: wx.getStorageSync('userLocation').latitude,
          longitude: wx.getStorageSync('userLocation').longitude,
          user_id: userId,
          goods_id: options.good_id,
          type,
        },
        success (res) {
          if (res.data.code == 0) {
            let banner = res.data.data.goods_pic.split(',');
            let shopScore1 = res.data.data.shop_score;
            // 地址截断
            res.data.data.shop_address.length > 32 ? res.data.data.shop_address = res.data.data.shop_address.slice(0, 32) + '…' : res.data.data.shop_address = res.data.data.shop_address;
            // 店名截断
            res.data.data.goods_name.length > 28 ? res.data.data.goods_name = res.data.data.goods_name.slice(0, 27) + '…' : res.data.data.goods_name = res.data.data.goods_name;
            // 芝麻记图片张数判断
            if (res.data.data.articles != ''){
              let zhimajiImgs = res.data.data.articles.imgurl.split(',')
              zhimajiImgs.length > 3 ? res.data.data.articles.imgurl = zhimajiImgs.slice(0, 3) : res.data.data.articles.imgurl = zhimajiImgs
            }
            // 是否存在弹幕
            res.data.trends.length != 0 ? that.setData({ hasDanmu: true }) : that.setData({ hasDanmu: false })
            //新评分机制
            switch (true) {
              case (shopScore1 < 1.25):
                that.setData({
                  heart: 1
                })
                break;
              case (shopScore1 >= 1.25 && shopScore1 < 1.75): 
                that.setData({
                  heart: 1.5
                })
                break;
              case (shopScore1 >= 1.75 && shopScore1 < 2.25): 
                that.setData({
                  heart: 2
                })
                break;
              case (shopScore1 >= 2.25 && shopScore1 < 2.75): 
                that.setData({
                  heart: 2.5
                })
                break;
              case (shopScore1 >= 2.75 && shopScore1 < 3.25):
                that.setData({
                  heart: 3
                })
                break;
              case (shopScore1 >= 3.25 && shopScore1 < 3.75): 
                that.setData({
                  heart: 3.5
                })
                break;
              case (shopScore1 >= 3.75 && shopScore1 < 4.25): 
                that.setData({
                  heart: 4
                })
                break;
              case (shopScore1 >= 4.25 && shopScore1 < 4.75): 
                that.setData({
                  heart: 4.5
                })
                break;
              case (shopScore1 >= 4.75): 
                that.setData({
                  heart: 5
                })
                break;
            }
            // for (let k = 0; k < res.data.data.other_goods.length; k++) {
            //   res.data.data.other_goods[k].shop_name.length > 20 ? res.data.data.other_goods[k].shop_name = res.data.data.other_goods[k].shop_name.slice(0, 19) + '…' : res.data.data.other_goods[k].shop_name = res.data.data.other_goods[k].shop_name
            // }
            setTimeout(function () {
              that.setData({
                recommad_list: res.data.data.other_goods,
              })
              wx.setStorageSync('other_goods', res.data.data.other_goods)
            }, 50)
            // 判断是否上传视频
            res.data.data.goods_video != '' ? that.setData({ videoShow: true, videoSrc: res.data.data.goods_video }) : that.setData({ videoShow: false, videoSrc: res.data.data.goods_video })

            // 弹幕截取
            res.data.trends.map ( (e) => {
              if (e.nickname.length >= 2) {
                e.nickname = e.nickname.slice(0, 1) + '**';
              } else {
                e.nickname = e.nickname;
              }
            })
            
            that.setData({
              banner: banner,
              goodItem: res.data.data,
              allShow: true,
              trends: res.data.trends,
              trends_info: res.data.trends[0]
            })
            that.setData({ loadComplete: true })
            wx.hideLoading();
            let j = 0;
            timer = setInterval(() => {
              j++
              if (j == that.data.trends.length) {
                j = 0;
              }
              that.setData({
                trends_info: that.data.trends[j]
              })
            }, 6000)
          }else {
            wx.showToast({
              title: '网络异常请重试',
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
          setTimeout(() => {
            wx.navigateBack({
              delta: 1
            })
          }, 1400)
        }
      })
    }, 50)
  },

  ShopDetailLoadAgain(page) {
    var that = this;
    setTimeout(() => {
      wx.request({
        url: 'https://kanjia.bigclient.cn/api/api/' + daily_good_url,
        method: 'POST',
        data: {
          latitude: wx.getStorageSync('userLocation').latitude,
          longitude: wx.getStorageSync('userLocation').longitude,
          user_id: userId,
          goods_id: that.data.goods_id,
          type,
          p: page
        },
        success(res) {
          if (res.data.code == 0) {
            // 店名截取 （ departed ）
            // for (let k = 0; k < res.data.data.other_goods.length; k++) {
            //   res.data.data.other_goods[k].shop_name.length > 20 ? res.data.data.other_goods[k].shop_name = res.data.data.other_goods[k].shop_name.slice(0, 19) + '…' : res.data.data.other_goods[k].shop_name = res.data.data.other_goods[k].shop_name
            // }
            setTimeout(function () {
              that.setData({
                recommad_list: that.data.recommad_list.concat(res.data.data.other_goods),
              })
            }, 50)
          }
        },
      })
    }, 60)
  },

  bargin: function (e) {
    var that = this;
    if (wx.getStorageSync('qrop') == '') {
      
    } else {
      var that = this;
      let good_id = e.target.id;
      let share_goods = e.currentTarget.dataset.img.split(',')[0];
      let good_price_share = e.currentTarget.dataset.price;
      this.setData({
        goods_id: good_id,
        goods_pic: share_goods,
        good_price_share,
        goodItem_sort: e.currentTarget.dataset.curprice
      })
      let goodItem_type;
      wx.getStorageSync('userLocation') != '' ? goodItem_type = 1 : goodItem_type = 0;
      // RSA加密
      let newStr = {
        user_id: wx.getStorageSync('qrop').id,
        goods_id: good_id,
        latitude: wx.getStorageSync('userLocation').latitude,
        longitude: wx.getStorageSync('userLocation').longitude,
        share_id: '',
        type: goodItem_type
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
        success: function (res) {
          if (res.data.code == 0) {
            that.setData({
              clickId: good_id,
              bargainPrice: res.data.data.bargain + '元'
            })
            setTimeout(function () {
              that.setData({
                clickId: '',
              })
            }, 2000)
            setTimeout( () => {
              for (let k = 0; k < that.data.recommad_list.length; k++) {
                if (that.data.recommad_list[k].id == good_id) {
                  // that.data.recommad_list[k].current_price = that.data.recommad_list[k].current_price - res.data.data.bargain
                  // that.data.recommad_list[k].current_price = that.data.recommad_list[k].current_price.toFixed(2)
                  // 过去最新价格
                  that.data.recommad_list[k].current_price = res.data.data.current_price;
                  if (that.data.recommad_list[k].button == '砍价') {
                    that.data.recommad_list[k].button = '继续砍'
                  } else {
                    if (/^砍[\d]+次$/.test(that.data.recommad_list[k].button) == true) {
                      let remain_time = parseInt(that.data.recommad_list[k].button.slice(1, that.data.recommad_list[k].button.length - 1)) - 1;
                      remain_time == '0' ? that.data.recommad_list[k].button = '继续砍' : that.data.recommad_list[k].button = '砍' + remain_time.toString() + '次';
                    }
                  }
                }
              }
              that.setData({
                recommad_list: that.data.recommad_list
              })
            }, 100)
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

  sellout: function () {
    wx.showToast({
      title: '该商品已抢完，下次要手快哦',
      icon: 'none'
    })
  },

  cancel_share () {
    this.setData({
      shareShow: false
    })
  },

  close_share_popup () {
    this.setData({
      shareShow: false,
      addNow: false
    })
  },

  test() {
    console.log('')
  },

  //获取用户手机号码
  getPhoneNumber: function (i) {
    var that = this;
    var mobile;
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/users/decryptData',
      method: 'POST',
      data: {
        session_key: wx.getStorageSync('session_key').session_key,
        data: i.detail.encryptedData,
        iv: i.detail.iv
      },
      success (res) {
        if(res.data.code == 0) {
          mobile = JSON.parse(res.data.data).purePhoneNumber;
          wx.request({
            url: 'https://kanjia.bigclient.cn/api/users/bindMobile',
            method: 'POST',
            data: {
              open_id: wx.getStorageSync('session_key').openid,
              mobile: mobile
            },
            success (res) {
              if (res.data.code == 0) {
                that.setData({
                  bindMobileShow: false,
                })
                Sesame.Sesame();
                setTimeout(function () {
                  wx.navigateTo({
                    url: '../payment/payment?id=' + that.data.goods_id,
                  })
                }, 100)
              } else {
                that.Login()
              }
            }
          })
        } else {
          that.Login()
        }
      },
      fail() {
        that.Login()
      }
    })
  },

  Login () {
    wx.login({
      success(res) {
        wx.request({
          url: 'https://kanjia.bigclient.cn/api/users/returnOpenid',
          method: 'POST',
          data: {
            code: res.code
          },
          success(res) {
            if (res.data.code == 0) {
              wx.setStorageSync('session_key', res.data.data);
            }
          }
        })
      }
    })
  },

  onShow () {
    var that = this;
    if (wx.getStorageSync('qrop') == '') {
      that.setData({ bindMobileShow: false, userLogin: true })
    } else {
      that.setData({ userLogin: false })
      if (wx.getStorageSync('qrop').mobile == '') {
        that.setData({ bindMobileShow: true })
      } else {
        that.setData({ bindMobileShow: false })
      }
    }

    let videoContext = wx.createVideoContext('myVideo');
    // 监听网络情况变化
    wx.onNetworkStatusChange( function(res) {
      if (res.networkType == 'wifi') {
        that.setData({ wifiAutoPlay: true })
        videoContext.play();
      }else {
        that.setData({ wifiAutoPlay: false })
        wx.showToast({
          title: '非wifi环境，视频播放取消',
          icon: 'none'
        })
        videoContext.pause();
      }
    })

    // wifi环境视频自动播放
    wx.getNetworkType({
      success (res) {
        res.networkType == 'wifi' ? that.setData({ wifiAutoPlay: true }) : that.setData({ wifiAutoPlay: false })
      }
    })
    
    console.log(this.data.bindMobileShow)
  },

  //授权
  bindgetuserinfo: function (e) {
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
          success (res) {
            if(res.data.code == 0) {
              if (wx.getStorageSync('qrop') != '') {
                if (wx.getStorageSync('qrop').mobile != '') {
                  wx.navigateTo({
                    url: '../payment/payment?id=' + that.data.goods_id,
                  })
                } 
                that.setData({ bindMobileShow: false })
              } else {
                that.setData({ bindMobileShow: true })
              }
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
              wx.setStorageSync('qrop', res.data.data);
            }
          }
        })
      }
    })
  },

  toReadArticle (e) {
    wx.navigateTo({
      url: '../zhimajiSingle/zhimajiSingle?id=' + e.currentTarget.dataset.id,
    })
  },

  readrMoreZhimaji (e) {
    wx.navigateTo({
      url: '../zhimajiDetail/zhimajiDetail?id=' + e.currentTarget.dataset.id,
    })
  },

  onHide: function () {
    var that = this;
    page = 1;
    this.setData({
      shareShow: false
    })
    if(this.data.readyToShare == true){
      that.BargainBeforeShare()
    }
    this.Saveshare();
  },

  onUnload () {
    var that = this;
    let barginNum = this.data.goodItem.text.split('人')[0];
    page = 1;
    let pages = getCurrentPages();
    let prepage = pages[pages.length - 2];
    if (prepage.__route__ == 'pages/index/index'){
      // 修改首页商品的价格（保持与商品详情页价格一致）
      for (let k = 0; k < prepage.data.goodsList.length; k++) {
        if (prepage.data.goodsList[k].id == that.data.goods_id) {
          prepage.data.goodsList[k].current_price = that.data.goodItem.current_price;
          prepage.data.goodsList[k].bargain_num = barginNum;
          // 更新砍价按钮状态
          if (that.data.goodItem.button == '已抢完') {
            prepage.data.goodsList[k].button = '已抢完';
          }
          setTimeout(() => {
            prepage.setData({
              'goodsList': prepage.data.goodsList,
            })
          }, 100)
        }
      }
      // 商品详情页修改首页砍价状态
      prepage.data.goodsList.map( e => {
        if (e.id == that.data.goods_id) {
          e.button = that.data.goodItem.bargain
        }
      })
      // 推荐列表修改首页商品的砍价状态
      for (let u = 0; u < prepage.data.goodsList.length; u++) {
        for( let y = 0; y < that.data.recommad_list.length; y++){
          if (prepage.data.goodsList[u].id == that.data.recommad_list[y].id) {
            prepage.data.goodsList[u].button =  that.data.recommad_list[y].button;
            prepage.data.goodsList[u].current_price = that.data.recommad_list[y].current_price
          }
        }
      }
      setTimeout( ()=> {
        prepage.setData({ 'goodsList': prepage.data.goodsList })
      },500)
    }

    // 清除定时器 
    clearInterval(timer)
  },

  // 跳转购买页
  buyNow: function () {
    var that = this;
    if(wx.getStorageSync('qrop') != ''){
      if (wx.getStorageSync('qrop').mobile != '') {
        wx.navigateTo({
          url: '../payment/payment?id=' + that.data.goods_id,
        })
      }
    }
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
      posterShow: false
    })
  },

  share_num() {
    this.setData({ backToShare: true })
  },

  Saveshare() {
    var that = this;
    let type;
    wx.getStorageSync('userLocation') != '' ? type = 1 : type = 0;
    if (that.data.backToShare == true) {
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
        success() {
          that.setData({ backToShare: false })
        }
      })
    }
  },

  // 视频
  videoPlay (e) {
    this.setData({ 
      autoplay: false,
      vidoePlaying: true
    })
  },

  videoPause (e) {
    this.setData({ 
      autoplay: true,
      vidoePlaying: false
    })
  },

  swiperItemChange (e) {
    var that = this;
    this.videoContext = wx.createVideoContext('myVideo')
    if(e.detail.current != 0){
      this.videoContext.pause()
    }else{
      if (that.data.vidoePlaying && that.data.wifiAutoPlay == true) this.videoContext.play()
    }
  },

  fullScreen (e) {
    var that = this;
    this.videoContext = wx.createVideoContext('myVideo')
    if(e.detail.fullScreen == false){
      this.videoContext.exitFullScreen()
    }
  },

  onReachBottom () {
    page ++;
    this.ShopDetailLoadAgain(page)
  },

  // 添加芝麻君
  addZhima () {
    this.setData({ addNow: true})
  },

  toAnswer () {
    this.setData({ addNow: false })
  },

  onShareAppMessage: function (res) {
    var that = this;
    let shared_id = wx.getStorageSync('qrop').id;
    let goods_id = this.data.goods_id;
    let share_imgUrl = 'http://new-bigclient.oss-cn-qingdao.aliyuncs.com' + this.data.goods_pic;
    if (res.from === 'button') {
      return {
        title: `原价¥${that.data.good_price_share},现在只要¥${that.data.goodItem_sort},快来帮我一下！`,
        path: 'pages/index/index?share_id=' + shared_id + '&goods_id=' + goods_id,
        imageUrl: share_imgUrl
      }
    }else if(res.from == 'menu'){
      if(wx.getStorageSync('qrop') != ''){
        that.setData({ readyToShare: true })
        return {
          title: `原价¥${that.data.goodItem.price},现在只要¥${that.data.goodItem.current_price},快来帮我一下！`,
          path: 'pages/index/index?share_id=' + wx.getStorageSync('qrop').id + '&goods_id=' + that.data.goodItemId,
          imageUrl: 'http://new-bigclient.oss-cn-qingdao.aliyuncs.com' + that.data.goodItem.goods_pic.split(',')[0],
        }
      }else {
        return {
          title: `原价¥${that.data.goodItem.price},现在只要¥${that.data.goodItem.current_price},快来帮我一下！`,
          path: 'pages/goodItem/goodItem?&good_id=' + that.data.goodItemId + '&share=' + true,
          imageUrl: 'http://new-bigclient.oss-cn-qingdao.aliyuncs.com' + that.data.goodItem.goods_pic.split(',')[0]
        }
      }
    }
  },

  // formId 
  codeSubmit (e) {
    Sesame.GetformId(e.detail.formId)
  },

  //分享前默认砍价
  BargainBeforeShare () {
    var that = this;
    let help_type;
    wx.getStorageSync('userLocation') != '' ? help_type = 0 : help_type = 1;
    let newStr = {
      user_id: wx.getStorageSync('qrop').id,
      goods_id: that.data.goodItemId,
      latitude: wx.getStorageSync('userLocation').latitude,
      longitude: wx.getStorageSync('userLocation').longitude,
      share_id: '',
      type: help_type
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
      success: function (res) {
        if (res.data.code == 0) console.log(res.data.data)
      }
    })
  }
})