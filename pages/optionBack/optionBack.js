var util = require('../../utils/util.js');
Page({
  data: {
    tempFilePaths:[],
    text:'',
    imgSrc:'',
    wordNumber:0,
    photoNumber:0
  },

  bindReplaceInput:function(e){
    // console.log(e.detail.value);
    this.setData({
      text: e.detail.value,
      wordNumber: e.detail.value.length
    })
  },

  addPic:function(){
    var that = this;
    var imgSrc= '';
    wx.chooseImage({
      count:3,
      sizeType:['compressed'],
      sourceType: ['album', 'camera'],
      success:function(res){
        // console.log(res.tempFiles)
        var tempFilePaths = res.tempFilePaths; 
        // for(let i=0;i<res.tempFiles.length;i++){
        //   console.log(res.tempFiles[i].】);
        // }
        that.setData({
          tempFilePaths: res.tempFilePaths,
          photoNumber:res.tempFiles.length
        })
        
        for (var i = 0; i < tempFilePaths.length; i++) {
          wx.uploadFile({
            url: 'https://kanjia.bigclient.cn/api/users/returnImgSrc',
            filePath: tempFilePaths[i],
            name: 'file',
            header: {
              // "Content-Type": "application/json"
              "content-type": 'application/x-www-form-urlencoded;charset=utf-8'
            },
            success(res) {
              imgSrc = JSON.parse(res.data).data + ',' + imgSrc;
              that.setData({
                imgSrc: imgSrc
              })
            }
          })
        }
      }
    })
  },

  submit:function(e){
    var that = this;
    if (that.data.wordNumber < 10){
      wx.showToast({
        title: '请输入至少10个字',
        icon:'none',
        duration:1500
      })
    }else{
      if(e.detail.value.mobile.length <8){
        wx.showToast({
          title: '请填写正确的联系方式',
          icon: 'none'
        })
      }else {
        wx.showLoading({
          title: '提交中',
          icon: 'none',
          mask: true
        })
        wx.request({
          url: 'https://kanjia.bigclient.cn/api/users/feedback',
          method: 'POST',
          data: {
            imgurl: that.data.imgSrc,
            content: that.data.text,
            user_id:wx.getStorageSync('qrop').id,
            mobile: e.detail.value.mobile
          },
          success: function (res) {
            if(res.data.code == 0){
              wx.hideLoading();
              wx.showToast({
                title: '反馈成功!',
                duration: 1500,
                mask: true
              })
              setTimeout(() => {
                that.setData({
                  text: '',
                  imgSrc: '',
                  tempFilePaths: [],
                  wordNumber: 0
                })
                wx.switchTab({
                  url: '../mine/mine',
                })
              }, 1300)
            }else {
              wx.showToast({
                title: '网络繁忙请重试!',
                mask: true,
                icon: 'none'
              })
            }
          },
          fail: function () {
            wx.hideLoading();
            wx.showToast({
              title: '网络繁忙请重试!',
              mask: true,
              duration: 2000,
              icon: 'none'
            })
          }
        })
      }
    }
  },

  // 删除图片
  deleteImg: function (e) {
    console.log(e);
    var that = this;
    var imgs = this.data.tempFilePaths;
    var index = e.currentTarget.dataset.index;
    imgs.splice(index,1);
    this.setData({
      tempFilePaths: imgs,
      photoNumber: that.data.photoNumber -1
    });
  },

  onLoad: function (options) {

  },

  onReady: function () {

  },

  onPullDownRefresh: function () {
    wx.showNavigationBarLoading();
    setTimeout(function () {
      wx.hideNavigationBarLoading()
      wx.stopPullDownRefresh()
    }, 1500);
  },
})