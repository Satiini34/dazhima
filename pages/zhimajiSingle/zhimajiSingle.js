const app = getApp();
const RSA = require('../../utils/wx_rsa.min.js');
Page({
  data: {
    zhimajiSingle: '',
    loadComplete: '',
    userLogin: false,
    shareShow: false,
    clickId: '',
    isBargin: false,
    goods_id: '',
    goods_pic: '',
    good_price_share: '',
    goodItem_sort: '',
    current: 0
  },

  onLoad: function (options) {
    var that = this;
    // 判断新老用户(服务器端是否有数据)
    if (wx.getStorageSync('qrop') != '') {
      that.setData({ userLogin: false })
    } else {
      that.setData({ userLogin: true })
    }
    wx.showNavigationBarLoading()
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: 'https://kanjia.bigclient.cn/api/api/articleDetail',
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id,
        article_id: options.id
      },
      success(res) {
        if(res.data.code == 0){
          res.data.data.imgurl = res.data.data.imgurl.split(',')
          console.log(res.data.data)
          that.setData({ 
            loadComplete: true,
            zhimajiSingle: res.data.data
          })
        }
      }
    })
    
    setTimeout(()=> {
      wx.hideLoading();
      wx.hideNavigationBarLoading();
    },500)
  },

  bingo(e) {
    var that = this;
    that.data.zhimajiSingle.status = !that.data.zhimajiSingle.status;
    if (that.data.zhimajiSingle.status == 1) {
      that.data.zhimajiSingle.num++
          wx.request({
            url: 'https://kanjia.bigclient.cn/api/api/addArticle',
            method: 'POST',
            data: {
              user_id: wx.getStorageSync('qrop').id,
              article_id: that.data.zhimajiSingle.id
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
              article_id: that.data.zhimajiSingle.id
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
          that.data.zhimajiSingle.num--
        }
    
    this.setData({ zhimajiSingle: that.data.zhimajiSingle })
  },

  // 全屏预览图片
  viewPic(e) {
    var that = this;
    let viewPicUrl;
    for (let k = 0; k < that.data.zhimaji_detail.length; k++) {
      if (that.data.zhimaji_detail[k].id == e.currentTarget.id) {
        viewPicUrl = that.data.zhimaji_detail[k].imgurl
        for (let i = 0; i < that.data.zhimaji_detail[k].imgurl.length; i++) {
          viewPicUrl[i] = 'https://new-bigclient.oss-cn-qingdao.aliyuncs.com' + that.data.zhimaji_detail[k].imgurl[i] + '?x-oss-process=style/abc';
        }
      }
    }
    wx.previewImage({
      urls: viewPicUrl // 需要预览的图片http链接列表
    })
  },

  // 砍价
  bargin: function (e) {
    var that = this;
    this.setData({ isBargin: true});
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
        goodItem_sort: e.target.dataset.sort
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
            }, 2000)
            that.data.zhimajiSingle.map( e => {
              console.log(e)
              if (e.id == that.data.goods_id) {
                e.current_price = res.data.data.current_price
                if (e.button == '砍价') {
                  e.button = '继续砍'
                } else {
                  if (/^砍[\d]+次$/.test(e.button) == true) {
                    let remain_time = parseInt(e.button.slice(1, e.button.length - 1)) - 1;
                    remain_time == '0' ? e.button = '继续砍' : e.button = '砍' + remain_time.toString() + '次';
                  }
                }
                that.setData({
                  zhimajiSingle: that.data.zhimajiSingle
                })
              }
            })
          } else if (res.data.code == 30001) {
            that.setData({
              shareShow: true
            })
          } else if (res.data.code == 30007) {
            wx.showToast({
              title: '该商品已被别人抢先下单，暂不能砍价！',
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

  cancel_share: function () {
    this.setData({
      shareShow: false
    })
  },

  close_share_popup: function () {
    this.setData({
      shareShow: false
    })
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

  onHide () {
    this.setData({
      shareShow: false,
      isBargin: false
    })
  },

  swiperChange: function (e) {
    if (e.detail.source == 'touch') {
      this.setData({
        current: e.detail.current
      })
    }
  },


  onShareAppMessage: function (res) {
    var that = this;
    let shared_id = wx.getStorageSync('qrop').id;
    let goods_id = this.data.zhimajiSingle.goods[0].id;
    let share_imgUrl = 'http://new-bigclient.oss-cn-qingdao.aliyuncs.com' + this.data.zhimajiSingle.goods[0].goods_pic.split(',')[0];
    if (res.from === 'button') {
      if (that.data.isBargin == true){
        return {
          title: '原价￥' + that.data.zhimajiSingle.goods[0].price + '，' + '我要去拔草这家' + that.data.zhimajiSingle.goods[0].subcategory_name + '店啦，快来帮我一下~',
          path: 'pages/index/index?share_id=' + shared_id + '&goods_id=' + goods_id,
          imageUrl: share_imgUrl
        }
      }else {
        return {
          title: that.data.zhimajiSingle.title,
          path: 'pages/zhimajiSingle/zhimajiSingle?id=' + that.data.zhimajiSingle.id,
          imageUrl: share_imgUrl
        }
      }
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
            if (res.data.code == 0) {
              wx.setStorageSync('qrop', res.data.data);
              that.setData({ userLogin: false })
            }
          }
        })
      }
    })
  },
})