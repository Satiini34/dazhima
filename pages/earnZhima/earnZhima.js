var util = require('../../utils/util.js');
Page({
  data: {
    tempFilePaths: [],
    text: '',
    imgSrc: '',
    wordNumber: 0,
    photoNumber: 0,
    orderNo: '',
  },

  bindReplaceInput: function (e) {
    this.setData({
      text: e.detail.value,
      wordNumber: e.detail.value.length
    })
  },

  addPic: function () {
    var that = this;
    var imgSrc = '';
    wx.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType: ['album'],
      success (res) {
        var tempFilePaths = res.tempFilePaths;
        that.setData({
          tempFilePaths: res.tempFilePaths,
          photoNumber: res.tempFiles.length
        })

        for (var i = 0; i < tempFilePaths.length; i++) {
          wx.uploadFile({
            url: 'https://kanjia.bigclient.cn/api/api/returnImgSrc',
            filePath: tempFilePaths[i],
            name: 'file',
            header: {
              "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
            },
            success(res) {
              if (res.statusCode == 200) {
                imgSrc = JSON.parse(res.data).data
                that.setData({
                  imgSrc
                })
              }else if(res == ''){
                wx.showToast({
                  title: '网络异常请重新上传',
                  icon: 'none'
                })
                that.setData({
                  tempFilePaths: []
                })
              }else {
                wx.showToast({
                  title: '网络异常请重新上传',
                  icon: 'none'
                })
                that.setData({
                  tempFilePaths: []
                })
              }
            }
          })
        }
      }
    })
  },

  submit: function (e) {
    var that = this;
    console.log(that.data.imgSrc)
    wx.showLoading({
      title: '提交中',
      mask: true
    })
    let orderNo = this.data.orderNo;
      wx.request({
        url: 'https://kanjia.bigclient.cn/api/api/evaluate',
        method: 'POST',
        data: {
          imgurl: that.data.imgSrc,
          user_id: wx.getStorageSync('qrop').id,
          orderNo
        },
        success (res) {
          if(res.data.code == 0){
            wx.hideLoading();
            wx.showToast({
              title: '评价成功',
            })
            setTimeout(function () {
              that.setData({
                imgSrc: '',
                tempFilePaths: [],
              })
              let nowPage = getCurrentPages();
              let backPage = nowPage[nowPage.length - 2];
              let routePath = backPage.route.split('/')[2]
              if (routePath == 'kanOrderList') {
                for (let i = 0; i < backPage.data.goodsList.length ; i++){
                  if (backPage.data.goodsList[i].orderNo == that.data.orderNo){
                    backPage.data.goodsList[i].is_use = '待审核'
                    backPage.setData({
                      'goodsList': backPage.data.goodsList
                    })
                  }
                }
              }else {
                let thripBack = nowPage[nowPage.length - 3];
                for (let i = 0; i < thripBack.data.goodsList.length; i++) {
                  if (thripBack.data.goodsList[i].orderNo == that.data.orderNo) {
                    thripBack.data.goodsList[i].is_use = '待审核'
                    thripBack.setData({
                      'goodsList': thripBack.data.goodsList
                    })
                  }
                }
                backPage.setData({
                  'commentStatus': '待审核'
                })
              }
              wx.navigateBack({
                delta: 1,
              })
            }, 1500)
          }else {
            wx.showToast({
              title: res.data.msg,
              icon: 'none'
            })
          }
        },
        fail () {
          wx.hideLoading();
          wx.showToast({
            title: '网络异常请重试',
            icon: 'none'
          })
        }
      })
  },

  // 删除图片
  deleteImg: function (e) {
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
    let nowPage = getCurrentPages();
    let backPage = nowPage[nowPage.length - 2];
    let routePath = backPage.route.split('/')[2]
    if (routePath == 'kanOrderList'){
      
    }
    this.setData({
      orderNo: options.id
    })
  }
})