const app = getApp();
const RSA = require('../../utils/wx_rsa.min.js');
let viewPicUrl;
let page = 1;
let article_id;
let previewId;
let shareList;
Page({
  data: {
    zhimaji_detail: [],
    imgheights: [],
    current: 0,
    readMoreIndex: true,
    readMoreId: '',
    loadComplete: true,
    userLogin: false,
    shareShow: false,
    clickId: '',
    goods_id: '',
    goods_pic: '',
    good_price_share: '',
    goodItem_sort: '',
    bargainPrice: '',
    swiperId: '',
    moreOrLess: '收起'
  },

  onLoad: function (options) {
    var that = this, zhimaji_remain;
    // 判断新老用户(服务器端是否有数据)
    if (wx.getStorageSync('qrop') != '') {
      that.setData({ userLogin: false })
      shareList = 'shareList';
    } else {
      that.setData({ userLogin: true })
      shareList = 'shareList2';
    }
    wx.hideNavigationBarLoading();
    wx.showLoading({
      title: '加载中',
    })
    article_id = options.id;
    that.LunchZhimaji();
  },

  // imageLoad: function (e) {//获取图片真实宽度  
  //   var imgwidth = e.detail.width,
  //     imgheight = e.detail.height,
  //     ratio = imgwidth / imgheight;
  //   // console.log(imgwidth, imgheight)
  //   //计算的高度值  
  //   var viewHeight = 750 / ratio;
  //   var imgheight = viewHeight;
  //   var imgheights = this.data.zhimaji_detail.imgurl;
  //   //把每一张图片的对应的高度记录到数组里  
  //   imgheights[e.target.dataset.id] = imgheight;
  //   this.setData({
  //     imgheights: imgheights
  //   })
  // },
  // bindchange: function (e) {
  //   this.setData({
  //     current: e.detail.current
  //   })
  // },

  LunchZhimaji() {
    var that = this;
    let type, zhimaji_remain;
    wx.getStorageSync('userLocation') != '' ? type = 1 : type = 0;
    wx.request({
      url: `https://kanjia.bigclient.cn/api/api/${shareList}`,
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id,
        latitude: wx.getStorageSync('userLocation').latitude,
        longitude: wx.getStorageSync('userLocation').longitude,
        type,
        article_id,
        p: page
      },
      success(res) {
        if (res.data.code == 0) {
          for (let i = 0; i < res.data.data.length; i++) {
            if (res.data.data[i].id == article_id) {
              zhimaji_remain = res.data.data.slice(i, res.data.data.length);
              for (let k = 0; k < zhimaji_remain.length; k++) {
                res.data.data[k].imgurl = res.data.data[k].imgurl.split(',')
              }
            }
          }
          if (res.data.data.length > 2){
            that.setData({ zhimaji_detail: that.data.zhimaji_detail.concat(zhimaji_remain) })
          }
          setTimeout(() => {
            that.setData({ loadComplete: true })
            wx.hideLoading();
          }, 500)
        }
      }
    })
  },

  readMore (e) {
    var that = this;
    let readMoreId = e.target.id;
    this.setData({ readMoreId })
  },

  readLess (e) {
    let readLessId = e.target.id; 
    this.setData({ readMoreId: '' })
  },

  // 首数据特殊处理
  readMoreOrLess () {
    this.setData({ readMoreIndex: !this.data.readMoreIndex})
    this.data.readMoreIndex == true ? this.setData({ moreOrLess: '收起' }) : this.setData({ moreOrLess: '展开' })
  },

  swiperChange: function (e) {
    // if (e.currentTarget.id != this.data.swiperId) this.setData({ current: 0 })
    this.setData({ swiperId: e.currentTarget.id})
    previewId = e.currentTarget.id;
    if (e.detail.source == 'touch') {
      this.setData({
        current: e.detail.current
      })
    }
  },

  // 跳转详情页
  toGoodItem (e) {
    wx.navigateTo({
      url: '../goodItem/goodItem?good_id=' + e.currentTarget.dataset.shopid,
    })
  },

  bingo(e) {
    var that = this;
    for (let j = 0; j < that.data.zhimaji_detail.length; j++) {
      if (that.data.zhimaji_detail[j].id == e.currentTarget.id) {
        that.data.zhimaji_detail[j].status = !that.data.zhimaji_detail[j].status;
        if (that.data.zhimaji_detail[j].status == 1) {
          that.data.zhimaji_detail[j].num++
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
          that.data.zhimaji_detail[j].num--
        }
      }
    }
    this.setData({ zhimaji_detail: that.data.zhimaji_detail })
  },

  // 全屏预览图片
  viewPic (e) {
    var that = this;
    let previewCurrent;
    previewId != e.currentTarget.id ? previewCurrent = 0 : previewCurrent = this.data.current
    previewId = e.currentTarget.id;
    for (let k = 0; k < that.data.zhimaji_detail.length;k++){
      if (that.data.zhimaji_detail[k].id == e.currentTarget.id){
        viewPicUrl = that.data.zhimaji_detail[k].imgurl
      }
    }
    for (let i = 0; i < viewPicUrl.length; i++) {
      if (viewPicUrl[i].slice(0, 5) != 'https'){
        viewPicUrl[i] = 'https://new-bigclient.oss-cn-qingdao.aliyuncs.com' + viewPicUrl[i];
      }else {
        viewPicUrl[i] = viewPicUrl[i]
      }
    }
    wx.previewImage({
      current: viewPicUrl[previewCurrent],
      urls: viewPicUrl // 需要预览的图片http链接列表
    })
  },

  onReachBottom () {
    var that = this;
    if(that.data.zhimaji_detail.length > 19){
      page = page + 1;
      that.LunchZhimaji();
    }
  },

  // 砍价
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
            }, 1200)
            setTimeout(function () {
              for (let k = 0; k < that.data.zhimaji_detail.length; k++) {
                for (let j = 0; j < that.data.zhimaji_detail[k].goods.length;j++){
                  if (that.data.zhimaji_detail[k].goods[j].id == good_id) {
                    that.data.zhimaji_detail[k].goods[j].current_price = res.data.data.current_price;
                    if (that.data.zhimaji_detail[k].goods[j].button == '砍价') {
                      that.data.zhimaji_detail[k].goods[j].button = '继续砍'
                    } else {
                      if (/^砍[\d]+次$/.test(that.data.zhimaji_detail[k].goods[j].button) == true) {
                        let remain_time = parseInt(that.data.zhimaji_detail[k].goods[j].button.slice(1, that.data.zhimaji_detail[k].goods[j].button.length - 1)) - 1;
                        remain_time == '0' ? that.data.zhimaji_detail[k].goods[j].button = '继续砍' : that.data.zhimaji_detail[k].goods[j].button = '砍' + remain_time.toString() + '次';
                      }
                    }
                    that.setData({
                      zhimaji_detail: that.data.zhimaji_detail
                    })
                  }
                }
              }
            }, 100)
          } else if (res.data.code == 30001) {
            that.setData({
              shareShow: true
            })
          } else if (res.data.code == 30007){
            wx.showToast({
              title: '该商品已抢完，下次要手快哦',
              icon: 'none'
            })
          }
        }
      })
    }
  },

  cancel_share: function () {
    this.setData({
      shareShow: false
    })
  },

  close_share_popup: function () {
    this.setData({
      shareShow: false,
      zhimajiShare: false
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

  onHide() {
    this.setData({
      shareShow: false,
    })
  },

  onShareAppMessage (res) {
    var that = this;
    let shared_id = wx.getStorageSync('qrop').id;
    let goods_id = this.data.goods_id;
    let share_imgUrl = 'http://new-bigclient.oss-cn-qingdao.aliyuncs.com' + this.data.goods_pic;
    if (res.from === 'button') {
      if (res.target.dataset == undefined) {
        return {
          title: '原价￥' + that.data.good_price_share + '，' + '我要去拔草这家' + that.data.goodItem_sort + '店啦，快来帮我一下~',
          path: 'pages/index/index?share_id=' + shared_id + '&goods_id=' + goods_id,
          imageUrl: share_imgUrl
        }
      } else {
        return {
          title: res.target.dataset.all.title,
          path: 'pages/zhimajiDetail/zhimajiDetail?id=' + res.target.dataset.all.id,
          imageUrl: 'https://new-bigclient.oss-cn-qingdao.aliyuncs.com' + res.target.dataset.all.imgurl[0]
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
            if(res.data.code == 0){
              wx.setStorageSync('qrop', res.data.data);
              that.setData({ userLogin: false })
            }
          }
        })
      }
    })
  },
})