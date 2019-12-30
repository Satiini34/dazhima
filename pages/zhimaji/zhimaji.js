var util = require('../../utils/util.js');
var imgSrc = '';

Page({
  data: {
    tempFilePaths: [],
    text: '',
    imgSrc: '',
    wordNumber: 0,
    photoNumber: 0,
    shopName: '餐厅名称',
    shop_id: '',
    count: '9',
    inputNow: false,
    checkboxDis: false,
    shops: [],
    titleInput: '',
    relativeShopShop: false,
    textValue: '去关联',
    shopCircle: '',
    shopSort: '',
    menuRectTop: '',
    relativeShopShow: false,
    timeStamp: -7777
  },

  bindReplaceInput: function (e) {
    // console.log(e.detail.value);
    this.setData({
      text: e.detail.value,
      wordNumber: e.detail.value.length
    })
  },

  titleInput (e) {
    this.setData({
      titleInput: e.detail.value,
    })
  },

  // 全屏预览图片
  viewPic(e) {
    var that = this;
    wx.previewImage({
      current: that.data.tempFilePaths[e.currentTarget.dataset.index],
      urls: that.data.tempFilePaths // 需要预览的图片http链接列表
    })
  },

  addPic () {
    var that = this;
    let tempFilePaths = that.data.tempFilePaths;
    wx.chooseImage({
      count: that.data.count,
      sizeType: ['compressed'],
      sourceType: ['album', 'camera'],
      success: function (res) {
        tempFilePaths = tempFilePaths.concat(res.tempFilePaths);
        for (let i = 0; i < tempFilePaths.length;i++){
          wx.compressImage({
            src: tempFilePaths[i], // 图片路径
            quality: 20, // 压缩质量
            success: function(res) {
              tempFilePaths += res.tempFilePath
            }
          })
        }
        that.setData({
          tempFilePaths: tempFilePaths,
          photoNumber: res.tempFiles.length,
          count: 9 - tempFilePaths
        })
        for (var i = 0; i < tempFilePaths.length; i++) {
          wx.uploadFile({
            url: 'https://kanjia.bigclient.cn/api/users/returnImgSrc',
            filePath: tempFilePaths[i],
            name: 'file',
            header: {
              "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
            },
            success(res) {
              imgSrc = JSON.parse(res.data).data;
              that.setData({
                imgSrc: imgSrc
              })
            }
          })
        }
      }
    })
  },

  // shopNameInput (e) {
    // wx.navigateTo({
    //   url: '../zhimajiSelectShop/zhimajiSelectShop',
    // })
  // },

  
  // 关闭关联商家框
  abandonShop () {
    this.setData({
      textValue: '去关联',
      shopName: '餐厅名称',
      shop_id: '',
      shopCircle: '',
      shopSort: '',
      relativeShopShow: false
    })
  },

  submit (e) {
    var that = this;
    if (that.data.tempFilePaths.length == 0){
      wx.showToast({
        title: '你还没有上传图片哦',
        icon: 'none'
      })
    }else{
      if (e.detail.value.title.length == 0) {
        wx.showToast({
          title: '标题要好看，更能吸引人',
          icon: 'none'
        })
      } else {
        if (e.detail.value.content.length < 10) {
          wx.showToast({
            title: '请输入至少10个字',
            icon: 'none'
          })
        } else { 
          if (that.data.shopName == '餐厅名称') {
            wx.showToast({
              title: '你还没有关联餐厅哦',
              icon: 'none'
            })
          } else {
            wx.cloud.init();
            wx.cloud.callFunction({
              name: 'msgSecCheck',
              data: ({
                text: e.detail.value.content.concat(e.detail.value.title)
              })
            }).then(res => {
              if (res.result.errCode == 87014) {
                wx.showToast({ title: '提交内容包含敏感词汇', icon: 'none' })
              } else{
                wx.showLoading({
                  title: '提交中，请等待',
                  mask: true
                })
                wx.request({
                  url: 'https://kanjia.bigclient.cn/api/api/publishArticle',
                  method: 'POST',
                  data: {
                    imgurl: that.data.imgSrc,
                    title: e.detail.value.title,
                    content: e.detail.value.content,
                    user_id: wx.getStorageSync('qrop').id,
                    shop_id: that.data.shop_id
                  },
                  success: function (res) {
                    if (res.data.code == 0) {
                      wx.hideLoading();
                      wx.showToast({
                        title: '提交成功',
                        mask: true
                      })
                      setTimeout(function () {
                        that.setData({
                          text: '',
                          titleInput: '',
                          imgSrc: '',
                          tempFilePaths: [],
                          wordNumber: 0,
                          shopName: '关联餐厅名称',
                          shop_id: ''
                        })
                        wx.navigateBack({
                          delta: 1
                        })
                      }, 1200)
                    } else {
                      wx.hideLoading()
                      wx.showToast({
                        title: '暂时不支持表情提交',
                        icon: 'none'
                      })
                    }
                  },
                  fail: function () {
                    wx.hideLoading();
                    wx.showToast({
                      title: '网络繁忙请重试!',
                      duration: 2000,
                      icon: 'none'
                    })
                  }
                })
              }
            })
          }
        }
      }
    }
  },

  // 删除图片
  deleteImg: function (e) {
    console.log(e);
    var that = this;
    var imgs = this.data.tempFilePaths;
    var index = e.currentTarget.dataset.index;
    imgs.splice(index, 1);
    this.setData({
      tempFilePaths: imgs,
      photoNumber: that.data.photoNumber - 1
    });
  },

  onLoad: function (options) {
    var that = this;
    const menuRect = wx.getMenuButtonBoundingClientRect();
    this.setData({
      menuRectTop: menuRect.top,
    })
  },

  notWriteNow () {
    wx.showModal({
      title: '确定要放弃编辑吗',
      content: '',
      cancelText: '暂时放弃',
      confirmText: '继续编辑',
      success: (res) => {
        if (res.confirm) {
          
        }else{
          wx.navigateBack({
            delta: 1,
          })
        }
      }
    })
  },

  onReady: function () {

  },

  shopChoose (e) {
    var that = this;
    if(e.timeStamp - this.data.timeStamp >= 7777){
      that.setData({ timeStamp: e.timeStamp });
      wx.navigateTo({
        url: '../zhimajiSelectShop/zhimajiSelectShop',
      })
    }
  }
})