const RSA = require('../../utils/wx_rsa.min.js');
var interval;
var time;
var touchDotX = 0;//触摸时的原点 
Page({
  data: {
    userInfo: '',
    gender:'',
    genderShow: false,
    goods_id: '',
    locationShow: false,
    picShow: false,
    logShow: false,
    isManager: false,
    managerName: '',
    shareShow: false,
    goods_pic: '',
    isShow: false,
    sign_in_day: '',
    zhimali: '',
    all_sesame: '',
    signInShow: false,
    clickId: '',
    posterShow: false,
    sharePoster: '',
    scopePhoto: true,
    good_allMsg: '',
    isBottom: false,
    isbigV: false,
    backToShare: false,
    goodItem_sort: '',
    goodsList: [],
    myRelease: [],
    myLiked: [],
    myLiked1: [],
    myLiked2: [],
    noLiked: '',
    norelease: '',
    current: 1,
    kanjiaList_height: '',
    redDot:false
  },

  onLoad: function (options) {
    var that = this;
    // 我的订单红点
    if (wx.getStorageSync('redDot') == true) {
      that.setData({
        redDot: true
      })
    }
  },

  order() {
    wx.navigateTo({
      url: '../kanOrderList/kanOrderList'
    })
    wx.removeStorageSync('redDot');
  },

  cooperate() {
    wx.navigateTo({
      url: '../cooperation/cooperation',
    })
  },

  feedback() {
    wx.navigateTo({
      url: '../optionBack/optionBack',
    })
  },

  myzhima() {
    wx.navigateTo({
      url: '../mission/mission',
    })
  },

  myreward() {
    wx.navigateTo({
      url: '../reward/reward',
    })
  },

  shopCenter() {
    var that = this;
    if(this.data.isManager == true) {
      that.data.managerName == '商户中心' ? wx.navigateTo({ url: '../shopCenter/shopCenter' }) : wx.navigateTo({ url: '../saleCenter/saleCenter' })
    }
  },

  newbie () {
    wx.navigateTo({
      url: '../newbie/newbie',
    })
  },

  becomeV () {
    wx.navigateTo({
      url: '../becomev/becomev',
    })
  },

  //跳转详情页
  goodItem: function (e) {
    wx.navigateTo({
      url: '../goodItem/goodItem?good_id=' + e.currentTarget.id,
    })
  },

  bargin: function (e) {
    var that = this;
    if (wx.getStorageSync('qrop') == '') {

    } else {
      let good_id = e.target.id;
      let share_goods = e.currentTarget.dataset.img.split(',')[0];
      this.setData({
        goods_id: good_id,
        goods_pic: share_goods,
        good_allMsg: e.currentTarget.dataset.all,
        goodItem_sort: e.target.dataset.sort
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
        type
      };
      let newStr1 = JSON.stringify(newStr);
      //rsa加密    
      let key = '-----BEGIN PUBLIC KEY-----MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAmyTfjCgg6uDR+Fq8p/OjeuleYzzLjGJlr047c7JEXOPbvWNecI5RJbHlLQJlGRxLqXS54l+B4wzmZVu1wpWH/XUhsvnNp3C/7dl6EXueskPUsARTFFCM/sdhSEoqenAmb9PkRfkBxgn8oLDBX1n2lsie8Gh/k9gJ2HQ7berdzuA4IXmPMkcKGWDOvS1Zdo0/xcrRS7QLdbuGZm5V8hkNbykY6LyghBUrwi252gRc4wvqQDEPHe3VWofrR3YuaHU9qhvOdKPqtBcXtkjJuEVA1/07DJSiWK4TmtwfIDu0S8P+5Puujrj8LVpSLaZcBIQXkJDzsZvJoQ1KAjVeLYbiCwIDAQAB-----END PUBLIC KEY-----'
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
            }, 1200)
            setTimeout(function () {
              that.Daily_goodsList();
            }, 500)
          } 
          if (res.data.code == 30001) {
            that.setData({
              shareShow: true
            })
          } 
          else if (res.data.code == 30007) {
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

  // sellout: function () {
  //   wx.showToast({
  //     title: '该商品已抢完，下次要手快哦',
  //     icon: 'none'
  //   })
  // },

  cancel_share: function () {
    this.Saveshare();
    this.setData({
      shareShow: false
    })
  },

  close_share_popup: function () {
    this.Saveshare();
    this.setData({
      shareShow: false,
    })
  },
  
  onReady () {
    wx.hideShareMenu();
  },

  onShow () {
    var that = this;
    setTimeout(() => {
      var query = wx.createSelectorQuery();
      query.select('#mykanjia').boundingClientRect()
      query.exec(res => {
        that.setData({ swiperHeight: parseInt(res[0].height) + 24 })
      })
      query.select('#mjltest').boundingClientRect()
      query.exec(res => {
        that.setData({ swiperHeight: parseInt(res[0].height) + 20 })
      })
      query.select('#mjltest2').boundingClientRect()
      query.exec(res => {
        that.setData({ swiperHeight: parseInt(res[0].height) + 20 })
      })
    }, 1000)

    if (wx.getStorageSync('qrop') != '') {
      that.setData({ isShow: false })
      that.setData({
        userInfo: wx.getStorageSync('qrop')
      })
      if (wx.getStorageSync('qrop').sex != 0) {
        that.setData({
          genderShow: true
        })
        if (wx.getStorageSync('qrop').sex == 1) {
          that.setData({
            gender: true
          })
        } else {
          that.setData({
            gender: false
          })
        }
      } else {
        that.setData({
          genderShow: false
        })
      }
    } else {
      that.setData({ isShow: true })
    } 
        
    setTimeout(function(){
      if (wx.getStorageSync('qrop').is_manager == 1) {
        that.setData({
          isManager: true,
          managerName: '商户中心'
        })
      } else if (wx.getStorageSync('qrop').is_manager == 2) {
        that.setData({
          isManager: true,
          managerName: '销售中心'
        })
      } else {
        that.setData({
          isManager: false
        })
      }
      wx.getStorageSync('qrop').vvip == 1 ? that.setData({ isbigV: true }) : that.setData({ isbigV: false })
      that.Daily_goodsList(); 
    },300)
    
    if (wx.getStorageSync('qrop') != '') {
      that.SignIn();
    }
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/getUserInfo',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id
      },
      success: function (res) {
        if (res.data.code == 0) {
          wx.setStorageSync('qrop', res.data.data);
          that.setData({ all_sesame: res.data.data.sesame })
        }
      }
    })

    // 我发布的
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/myPublishedArticles',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id
      },
      success: function (res) {
        if (res.data.code == 0) {
          if (res.data.data.length == 0) {
            that.setData({ norelease: true })
          } else {
            for (let j = 0; j < res.data.data.length; j++) {
              // 截取首图
              res.data.data[j].imgurl = res.data.data[j].imgurl.split(',')[0];
            }
            that.setData({
              norelease: false,
              myRelease: res.data.data
            })
          }
        }
      }
    })

    // 我点赞的
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/myCollection',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id
      },
      success: function (res) {
        if (res.data.code == 0) {
          if(res.data.data.length == 0){
            that.setData({ noLiked: true})
          }else {
            for (let j = 0; j < res.data.data.length; j++) {
              // 截取首图
              res.data.data[j].imgurl = res.data.data[j].imgurl.split(',')[0];
            }
            that.setData({
              noLiked: false,
              myLiked: res.data.data,
            })
          }
        }
      }
    })

    wx.hideTabBarRedDot({
      index: 2,
    })

    if(wx.getStorageSync('redDot') == '') this.setData({redDot: false})
  },

  bingoRelease (e) {
    var that = this;
    for (let j = 0; j < that.data.myRelease.length; j++) {
      if (that.data.myRelease[j].id == e.currentTarget.id) {
        that.data.myRelease[j].status = !that.data.myRelease[j].status;
        if (that.data.myRelease[j].status == 1) {
          that.data.myRelease[j].num++
          wx.request({
            url: 'https://kanjia.bigclient.cn/api/api/addArticle',
            method: 'POST',
            data: {
              user_id: wx.getStorageSync('qrop').id,
              article_id: e.currentTarget.id
            },
            success(res) {
              if (res.data.code == 0) {
                wx.showToast({
                  title: '点赞成功',
                  icon: 'none'
                })
              }
            }
          })
        } else {
          wx.request({
            url: 'https://kanjia.bigclient.cn/api/api/deleteArticle',
            method: 'POST',
            data: {
              user_id: wx.getStorageSync('qrop').id,
              article_id: e.currentTarget.id
            },
            success(res) {
              if (res.data.code == 0) {
                wx.showToast({
                  title: '取消点赞',
                  icon: 'none'
                })
              }
            }
          })
          that.data.myRelease[j].num--
        }
      }
    }
    this.setData({ myRelease: that.data.myRelease })
  },

  bingoLike(e) {
    var that = this;
    for (let j = 0; j < that.data.myLiked.length; j++) {
      if (that.data.myLiked[j].id == e.currentTarget.id) {
        that.data.myLiked[j].status = !that.data.myLiked[j].status;
        if (that.data.myLiked[j].status == 1) {
          that.data.myLiked[j].num++
          wx.request({
            url: 'https://kanjia.bigclient.cn/api/api/addArticle',
            method: 'POST',
            data: {
              user_id: wx.getStorageSync('qrop').id,
              article_id: e.currentTarget.id
            },
            success(res) {
              if (res.data.code == 0) {
                wx.showToast({
                  title: '点赞成功',
                  icon: 'none'
                })
              }
            }
          })
        } else {
          wx.request({
            url: 'https://kanjia.bigclient.cn/api/api/deleteArticle',
            method: 'POST',
            data: {
              user_id: wx.getStorageSync('qrop').id,
              article_id: e.currentTarget.id
            },
            success(res) {
              if (res.data.code == 0) {
                wx.showToast({
                  title: '取消点赞',
                  icon: 'none'
                })
              }
            }
          })
          that.data.myLiked[j].num--
        }
      }
    }
    this.setData({ myLiked: that.data.myLiked })
  },

  toDetail (e) {
    wx.navigateTo({
      url: '../zhimajiSingle/zhimajiSingle?id=' + e.currentTarget.dataset.detail.id,
    })
  },

  Daily_goodsList () {
    var that = this;
    let current_type;
    wx.getStorageSync('userLocation') != '' ? current_type = 1 : current_type = 0;
    if (wx.getStorageSync('qrop') != '') {
      wx.request({
        url: 'https://kanjia.bigclient.cn/api/api/currentBargainList',
        method: 'POST',
        data: {
          latitude: wx.getStorageSync('userLocation').latitude,
          longitude: wx.getStorageSync('userLocation').longitude,
          user_id: wx.getStorageSync('qrop').id,
          type: current_type
        },
        success: function (res) {
          if (res.data.code == 0) {
            if (res.data.data.length == 0) {
              that.setData({
                picShow: true
              })
            } else {
              // for (let k = 0; k < res.data.data.length; k++) {
              //   res.data.data[k].shop_name.length > 20 ? res.data.data[k].shop_name = res.data.data[k].shop_name.slice(0, 19) + '…' : res.data.data[k].shop_name = res.data.data[k].shop_name
              // }
              // // 判断我正在砍列表长度 
              // let kanjiaList_height;
              // if( wx.getStorageSync('systemInfo').pixelRatio >= 2.5) {
              //   kanjiaList_height = res.data.data.length * (520 / wx.getStorageSync('systemInfo').pixelRatio)
              // }else {
              //   kanjiaList_height = res.data.data.length * (324 / wx.getStorageSync('systemInfo').pixelRatio)
              // }
              // setTimeout(function () {
              //   that.setData({
              //     goodsList: res.data.data,
              //     isBottom: true,
              //     swiperHeight: kanjiaList_height,
              //     kanjiaList_height: kanjiaList_height
              //   })
              // }, 100)
              setTimeout(function () {
                that.setData({
                  goodsList: res.data.data,
                  isBottom: true,
                })
              }, 100)
              that.setData({
                locationShow: true,
                picShow: false,
              })
            }
          } else {
            that.setData({
              picShow: true
            })
          }
        }
      })
    }
  },

  //授权
  bindgetuserinfo: function (e) {
    var that = this;
    wx.getUserInfo({
      success: res => {
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
            if (wx.getStorageSync('qrop').sex != 0) {
              that.setData({
                genderShow: true
              })
              if (wx.getStorageSync('qrop').sex == 1) {
                that.setData({
                  gender: true
                })
              } else {
                that.setData({
                  gender: false
                })
              }
            } else {
              that.setData({
                genderShow: false
              })
            }
            if (res.data.data.get_sesame_status == 1) {
              wx.showModal({
                title: '恭喜你获得1000芝麻粒',
                content: '1000芝麻粒=10元现金',
                cancelText: '确认',
                confirmText: '查看',
                success(res) {
                  if (res.confirm) wx.navigateTo({ url: '../mission/mission', })
                }
              })
            }
            // setTimeout(() => {
            //   that.setData({ newCustomer: false })
            // }, 1500)
            that.setData({ 
              isShow:false,
              userInfo: res.data.data,
              picShow: true
            })
          }
        })
      }
    })
  },

  SignIn() {
    var that = this;
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/signIn',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id
      },
      success: function (res) {
        if (res.data.code == 0) {
          let zhimali = res.data.data.get_sesame;
          let sign_in_day = res.data.data.sign_in_day;
          let closeTime = Date.parse(new Date);
          that.setData({ sign_in_day })
          if (wx.getStorageSync('ifShow') == '' || wx.getStorageSync('ifShow') < closeTime) {
            that.setData({
              zhimali,
              all_sesame: parseInt(that.data.all_sesame) + zhimali,
              signInShow: true
            })
          } else {
            that.setData({
              signInShow: false
            })
          }
        }
      }
    })
  },

  toMission() {
    this.Recordsign();
    wx.navigateTo({
      url: '../mission/mission',
    })
  },

  closeSign() {
    this.Recordsign();
  },

  Recordsign() {
    this.setData({
      signInShow: false
    })
    let x = new Date(new Date(new Date().toLocaleDateString()).getTime() + 24 * 60 * 60 * 1000 - 1);
    let y = Date.parse(x);
    wx.setStorageSync('ifShow', y)
  },

  onHide: function () {
    this.setData({
      shareShow: false,
      backToShare: true
    })
  },

  Saveshare () {
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
    // 分享点击量加1
    let type;
    wx.getStorageSync('userLocation') != '' ? type = 1 : type = 0;
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/saveShareNum',
      method: 'POST',
      data: {
        goods_id: that.data.goods_id,
        latitude: wx.getStorageSync('userLocation').latitude,
        longitude: wx.getStorageSync('userLocation').longitude,
        type
      }
    })
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

  onShareAppMessage: function (res) {
    var that = this;
    console.log(res)
    let shared_id = wx.getStorageSync('qrop').id;
    let goods_id = this.data.goods_id;
    let share_imgUrl = 'http://new-bigclient.oss-cn-qingdao.aliyuncs.com' + this.data.goods_pic;
    if (res.from === 'button') {
      return {
        title: `原价¥${that.data.good_allMsg.price},现在只要¥${that.data.good_allMsg.current_price},快来帮我一下！`,
        path: 'pages/index/index?share_id=' + shared_id + '&goods_id=' + goods_id,
        imageUrl: share_imgUrl
      }
    }
  },

  toRelease() {
    wx.navigateTo({
      url: '../zhimaji/zhimaji',
    })
  },

  // newBeeToLook() {
  //   wx.navigateTo({
  //     url: '../mission/mission',
  //   })
  // },
  
  // 三栏
  selectNote () {
    this.setData({ current: 0})
  },

  selectKan() {
    this.setData({ current: 1 })
  },

  selectLike() {
    this.setData({ current: 2 })
  },

  // 触摸移动事件 
  // touchStart: function (e) {
  //   touchDotX = e.touches[0].pageX; // 获取触摸时的原点
  //   // 使用js计时器记录时间    
  //   interval = setInterval(() => {
  //     time++;
  //   }, 100);
  // },
  // // 触摸结束事件
  // touchEnd: function (e) {
  //   var that = this;
  //   let touchMoveX = e.changedTouches[0].pageX;
  //   let tmX = touchMoveX - touchDotX;
  //   if (time < 20) {
  //     let absX = Math.abs(tmX);
  //     if (tmX < -60) {
  //       // con,sole.log("左滑=====")
  //       that.data.columnNo < 3 ? that.setData({ columnNo: that.data.columnNo + 1 }) : that.setData({ columnNo: 1 })
  //     } 
  //     if (tmX > 60) {
  //       // console.log("右滑=====")
  //       that.data.columnNo > 1 ? that.setData({ columnNo: parseInt(that.data.columnNo) - 1 }) : that.setData({ columnNo: 3 })
  //     }
  //   }
  //   clearInterval(interval); // 清除setInterval
  //   time = 0;
  // },

  swiperChange (e) {
    var that = this;
    var query = wx.createSelectorQuery(); 
    switch (e.detail.current) {
      case 0: 
        query.select('#mjltest').boundingClientRect()
        query.exec(res => {
          that.setData({ swiperHeight: parseInt(res[0].height) + 32, current: 0 })
        })
        break;
      case 1:
        this.setData({ current: 1})
        if (that.data.goodsList != undefined){
          query.select('#mykanjia').boundingClientRect()
          query.exec(res => {
            that.setData({ swiperHeight: parseInt(res[0].height) + 30, current: 1 })
          })
        } 
        break;
      case 2:
        query.select('#mjltest2').boundingClientRect()
        query.exec(res => {
          that.setData({ swiperHeight: parseInt(res[0].height) + 40, current: 2 })
        })
        break;
    }
  }
})
