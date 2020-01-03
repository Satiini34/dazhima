const RSA = require('../../utils/wx_rsa.min.js');
const Sesame = require('../../utils/util.js');
const app = getApp();
Page({
  data: {
    loadComplete: false,
    item:'',
    mobile: '',
    goods_id: '',
    sesame: '',
    sesame_pay: true,
    pay_amount: '',
    fake_pay: '',
    real_pay:'',
    menuRectTop: '',
    versionBelow: false,
    haveRead: false,
    paySuccess: false,
    clickId: '',
    bargainPrice: '',
    goodsList: [],
    userDisconut: [],
    useDiscountNow: false,
    canBuyNow: false,
    discount: '',
    discountChoice: '使用优惠券',
    cardUseColor: '#ff8831',
    sesmaeDisabled: false
  },

  onLoad: function (options) {
    var that = this;
    wx.showLoading({
      title: '支付准备中',
    })
    wx.removeStorageSync('quitPay');
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
    })

    let goods_id = options.id;
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/dailyGoodsDetail',
      method: 'POST',
      data: {
        latitude: 30,
        longitude: 120,
        user_id: wx.getStorageSync('qrop').id,
        goods_id: goods_id
      },
      success: function (res) {
        if(res.data.code == 0){
          res.data.data.goods_pic = res.data.data.goods_pic.split(',')[0];
          that.setData({
            item: res.data.data,
            real_pay: res.data.data.current_price,
            goods_id: goods_id,
          })
          // 芝麻粒个数
          let sesame_have = wx.getStorageSync('qrop').sesame;
          // 抵扣芝麻粒比例
          let percent;
          wx.getStorageSync('percentange') == '' ? percent = 40 : percent = wx.getStorageSync('percentange') * 100;
          let change_sesame = parseInt(res.data.data.current_price * percent)
          let sesame_use;
          sesame_have >= change_sesame ? sesame_use = change_sesame : sesame_use = sesame_have
          let paypay = res.data.data.current_price - sesame_use / 100;
          // let pay_amount = paypay.substring(0, paypay.indexOf(".") + 3);
          let pay_amount = paypay.toFixed(2);
          that.setData({
            mobile: wx.getStorageSync('qrop').mobile,
            sesame: sesame_use,
            pay_amount,
            fake_pay: pay_amount,
          })
          setTimeout( ()=> {
            wx.hideLoading();
            that.setData({ loadComplete: true })
          }, 100)
        } else {  
          wx.hideLoading();
          wx.navigateBack({
            delta: 1
          })
        }
      },
      fail (){
        wx.hideLoading();
        wx.showToast({
          title: '网络异常，请重试！',
          icon: 'none',
          duration: 2000
        })
        setTimeout( ()=> {
          wx.navigateBack({
            delta: 1
          })
        } ,1500)
      }
    })

    if (wx.getStorageSync('qrop') != '') {
      wx.request({
        url: 'https://kanjia.bigclient.cn/api/api/getUserInfo',
        method: 'POST',
        data: {
          user_id: wx.getStorageSync('qrop').id
        },
        success (res) {
          if (res.data.code == 0) {
            wx.setStorageSync('qrop', res.data.data);
            let discountList = res.data.data.discount;
            let list = [{ id: 0, coupon_name: '不使用', pick: true }];
            discountList.map(e => {
              let discount = (e.discount * 10).toFixed(1)
              if (discount.split('.')[1] == '0') {
                discount = discount.slice(0, 1) + '折'
              } else {
                discount = discount + '折'
              }
              let everyThing = e;
              e.discountShow = discount;
              e.pick = false;
              e.not_allow.split(',').map(e => {
                if (e == goods_id.slice(0, 6)) {
                  everyThing.disabled = true;
                }else {
                  everyThing.disabled = false;
                }
              })

              // 将时间戳转化
              e.expire_time = '有效期至' + Sesame.tsFormatTime(e.expire_time * 1000, 'Y.M.D h:m:s')
            })
            if (res.data.data.discount != '') {
              that.setData({
                userDisconut: list.concat(discountList)
              })
            }
          }
        }
      })
    }

    this.setData({
      goodsList: wx.getStorageSync('other_goods'),
    })
  },

  scrolling (e) {
    
  },

  notPayNow: function () {
    wx.setStorageSync('quitPay', 'yes');
    if(this.data.haveRead == false){
      wx.showModal({
        title: '确定要放弃付款吗',
        content: '',
        cancelText: '暂时放弃',
        confirmText: '继续支付',
        success: (res) => {
          if (res.confirm) {

          } else if (res.cancel) {
            wx.navigateBack({
              delta: 1,
            })
          }
        }
      })
    }else {
      // 上个页面数据修改
      wx.navigateBack({
        delta: 1,
      })
    }
  },

  payNow() {
    var that = this; 
    if (that.data.canBuyNow == true){
      that.setData({ haveRead: false, canBuyNow: false })
      // 订阅消息
      // wx.requestSubscribeMessage({
      //   tmplIds: ['NM_WzhT-F-aUIZV32VrPMNsTJEgNCV5m6cvwQHC8Jr0', 'HLpsnFLOrQVWYqNM1eenvF1Qc8u18qMQXHYfWH6xODE', 'IKffD556V0KbPV9R07JgUoOCozD3d4ia6AUPPSv3v4I'],
      //   success (res) {
      //     that.Nofeedback_rsa();
      //   }
      // })
      that.Nofeedback_rsa();
    }else {
      wx.pageScrollTo({
        scrollTop: 600,
        duration: 300
      })
      setTimeout(function(){
        wx.showToast({
          title: '请先阅读使用说明',
          icon: 'none',
          duration: 2000
        })
      },500)
    }
  },

  //是否使用芝麻粒
  deduction: function (e) {
    var that = this;
    if (this.data.sesame_pay == false && this.data.sesmaeDisabled != false) {
      wx.showToast({
        title: '折扣券与芝麻粒不能同时使用',
        icon: 'none'
      })
    } else {
      let true_false = !that.data.sesame_pay
      this.setData({
        sesame_pay: true_false
      })
      if (true_false) {
        that.setData({
          sesame_pay: true,
          pay_amount: that.data.fake_pay
        })
        if (that.data.userDisconut != '') {
          that.data.userDisconut.map( e => {
            if(e.id == 0) {
              e.pick = true
            }else {
              e.pick = false
            }
          })
          that.setData({
            userDisconut: that.data.userDisconut
          })
        }
      }else {
        that.setData({
          sesame_pay: false,
          pay_amount: that.data.real_pay
        })
      }
    }
  },

  // 用户须知
  checkboxChange(e) {
    var that = this;
    this.setData({ haveRead: !that.data.haveRead })
    that.data.haveRead == true ? that.setData({ canBuyNow: true }) : that.setData({ canBuyNow: false })
  },

  onUnload: function () {
    var that = this;
    Sesame.Sesame();
    if (that.data.paySuccess == false){
      if (wx.getStorageSync('quitPay') != 'yes') {
        wx.showModal({
          content: '确认退出购买？别被别人抢走啦',
          confirmText: '购买',
          showCancel: true,
          cancelText: '退出',
          success(res) {
            if (res.confirm) {
              wx.navigateTo({
                url: '../payment/payment?id=' + that.data.goods_id,
              })
            }
          }
        })
      }
    }
  },

  // 支付后页面数据
  //跳转详情页
  goodItem (e) {
    wx.navigateTo({
      url: '../goodItem/goodItem?good_id=' + e.currentTarget.id,
    })
  },

  // 砍价
  bargin (e) {
    var that = this;
    let good_id = e.target.id;
    let share_goods = e.currentTarget.dataset.img.split(',')[0]
    this.setData({
      goods_id: good_id,
      goods_pic: share_goods
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
    let key = app.globalData.rsaKey;
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
          }, 1500)
          setTimeout(function () {
            for (let k = 0; k < that.data.goodsList.length; k++) {
              if (that.data.goodsList[k].id == that.data.goods_id) {
                that.data.goodsList[k].current_price = that.data.goodsList[k].current_price - res.data.data.bargain
                that.data.goodsList[k].current_price = that.data.goodsList[k].current_price.toFixed(2)
                if (that.data.goodsList[k].button == '砍价') {
                  that.data.goodsList[k].button = '继续砍'
                  // that.Priceshow(k)
                } else {
                  if (/^砍[\d]+次$/.test(that.data.goodsList[k].button) == true) {
                    let remain_time = parseInt(that.data.goodsList[k].button.slice(1, that.data.goodsList[k].button.length - 1)) - 1;
                    remain_time == '0' ? that.data.goodsList[k].button = '继续砍' : that.data.goodsList[k].button = '砍' + remain_time.toString() + '次';
                    // that.Priceshow(k)
                  }
                }
                that.setData({
                  goodsList: that.data.goodsList
                })
              }
            }
          }, 300)
        } else if (res.data.code == 30001) {
          wx.hideTabBar();
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
  },

  back() {
    wx.switchTab({
      url: '../index/index',
    })
  },

  Nofeedback_rsa () {
    var that = this;
    let goos_id = this.data.goods_id;
    wx.setStorageSync('buyGoodsId', goos_id)
    let sesame_use, discountUse;
    this.data.sesame_pay == true ? sesame_use = this.data.sesame : sesame_use =  0; 
    let no_pay_open_id = wx.getStorageSync('session_key').openid;
    this.data.discount == '' ? discountUse = 1 : discountUse = this.data.discount
    let newStr = { open_id: no_pay_open_id, sesame: sesame_use, goods_id: goos_id, discount: discountUse };
    // console.log(newStr);
    let newStr1 = JSON.stringify(newStr);
    let key = app.globalData.rsaKey;
    var encrypt_rsa = new RSA.RSAKey();
    encrypt_rsa = RSA.KEYUTIL.getKey(key);
    var encStr = encrypt_rsa.encrypt(newStr1);
    encStr = RSA.hex2b64(encStr);
    // console.log("加密结果：" + encStr);
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/pay/orderByProgramWxpay',
      method: "POST",
      data: {
        encrypted_data: encStr
      },
      success (res) {
        if(res.data.code == 0){
          wx.requestPayment({
            openId: wx.getStorageSync('session_key').openid,
            timeStamp: res.data.data.timeStamp,
            nonceStr: res.data.data.nonceStr,
            package: res.data.data.package,
            signType: 'MD5',
            paySign: res.data.data.sign,
            success (res) {
              wx.pageScrollTo({
                scrollTop: 0,
                duration: 100
              })
              that.setData({ paySuccess: true })
              wx.setStorageSync('paySuccess', true)
              let pages = getCurrentPages();
              let prepage = pages[pages.length - 2];
              prepage.setData({
                'goodItem.button': '已抢完'
              })
              // 订阅消息
              // wx.requestSubscribeMessage({
              //   tmplIds: ['NM_WzhT-F-aUIZV32VrPMNsTJEgNCV5m6cvwQHC8Jr0', 'HLpsnFLOrQVWYqNM1eenvF1Qc8u18qMQXHYfWH6xODE', 'IKffD556V0KbPV9R07JgUoOCozD3d4ia6AUPPSv3v4I'],
              // })
            },
            fail() {
              wx.showToast({
                title: '支付失败',
                icon: 'none',
                duration: 2000
              })
            }
          })
        }else {
          wx.showToast({
            title: res.data.msg,
            icon: 'none',
            duration: 2000
          })
        }
      }
    })
  },

  useDiscount () {
    this.setData({ useDiscountNow: true })
  },

  maskCancel () {
    var that= this;
    this.setData({ useDiscountNow: false })
    this.data.userDisconut.map (e => {
      if(e.id != 0) {
        if(e.pick == true) {
          that.setData({
            pay_amount: (that.data.item.price * e.discount).toFixed(2),
            discount: e.discount
          })
        } 
      } else {
        if(e.pick == true) {
          that.setData({
            pay_amount: that.data.real_pay,
            discount: '',
          })
        }
      }
    })
  },

  cantUse () {
    wx.showToast({
      title: '抱歉，无法使用此优惠券',
      icon: 'none'
    })
  },

  cardUse (e) {
    var that = this;
    let discountChoice = e.currentTarget.dataset.name;
    let idHave = e.currentTarget.id;
    this.data.userDisconut.map( e => {
      if (idHave != 0) {
        if (e.id == idHave) {
          e.pick = true;
        }else {
          e.pick = false
        }
        that.setData({
          pay_amount: that.data.real_pay,
          discountChoice,
          cardUseColor: '#ff8831',
          sesmaeDisabled: true,
          sesame_pay: false
        })
      }else {
        if (e.id == 0) {
          e.pick = true;
          that.setData({
            pay_amount: that.data.fake_pay,
            cardUseColor: '#999',
            discountChoice: '不使用',
            sesmaeDisabled: false
          })
        }else {
          e.pick = false
        }
      }
    })
    this.setData({
      userDisconut: that.data.userDisconut
    })
  }
})