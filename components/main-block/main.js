const app = getApp();
const RSA = require('../../utils/wx_rsa.min.js');
Component({
  properties: {
    goodList: {
      type: Array,
      value: []
    }
  },

  data: {
    goodListShow: [],
    userLogin: true,
    good_id: '',
    allGoodDetail: ''
  },

  ready() {
    var that = this;
    setTimeout( ()=> {
      wx.getStorageSync('qrop') != '' ? that.setData({ userLogin: false }) : that.setData({ userLogin: true })
      that.setData({
        goodListShow: that.data.goodList
      })
    }, 666)
  },

  methods: {
    // 砍价
    bargin(e) {
      var that = this;
      let good_id = e.target.id;
      this.setData({
        good_id: e.target.id,
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
      };
      let newStr1 = JSON.stringify(newStr);
      //rsa加密
      var key = app.globalData.rsaKey;
      let encrypt_rsa = new RSA.RSAKey();
      encrypt_rsa = RSA.KEYUTIL.getKey(key);
      let encStr = encrypt_rsa.encrypt(newStr1);
      encStr = RSA.hex2b64(encStr);
      that.Bargain(encStr, good_id);
    },

    faceClose() {
      this.setData({
        posterShow: false,
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

    Bargain(n, id) {
      var that = this;
      wx.request({
        url: 'https://kanjia.bigclient.cn/api/api/bargainList',
        method: 'POST',
        data: {
          encrypted_data: n
        },
        success (res) {
          if (res.data.code == 0) {
            that.setData({
              clickId: id,
              bargainPrice: res.data.data.bargain + '元'
            })
            setTimeout(function () {
              that.setData({
                clickId: '',
              })
            }, 1300)
            that.data.goodListShow.map(e => {
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
                  goodListShow: that.data.goodListShow
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
  },

  pageLifetimes: {
    show() {

    }
  }
})