var page = 1;
var sort = 1;
let heightLeft = 0;
let heightRight = 0;
let isBeRefresh = false;
let articleList;
Page({
  data: {
    articleList: [],
    articleList_bak: [],
    clickNo: 1,
    loadComplete: false,
    waterfallHeight: '',
    isShow: false,
    current: 0,
    topDistance: 0,
    bottomDistance: 0,
    presetDistance: 0,
    refreshNow: false,
    loginIn: false 
  },

  onLoad: function (options) {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    wx.showNavigationBarLoading();
    // 是否授权
    if(wx.getStorageSync('qrop') != '') this.setData({ loginIn: true })
    // 判断机型
    wx.getStorageSync('systemInfo').platform == 'ios' ? this.setData({ bottomDistance: -42, topDistance: -20, presetDistance: 1 }) : this.setData({ bottomDistance: 10, topDistance: 0 })
    // 判断是否授权
    wx.getStorageSync('qrop') != '' ? articleList = 'articleList' : articleList = 'articleList2';
    this.LunchOrigin(1)
  },

  swiperChange(e) {
    var that = this;
    switch (e.detail.current) {
      case 0:
        sort = 1;
        if (that.data.articleList == '') that.LunchOrigin(sort)
        that.setData({ clickNo: 1, current: 0, presetDistance: 1 })
        break;
      case 1:
        sort = 2;
        if (that.data.articleList_bak == '') {
          page = 1;
          that.LunchOrigin(sort)
        }
        that.setData({ clickNo: 2, current: 1, presetDistance: 1 }) 
        break;
    }
  },

  waterfallImageLeft(e) {
    heightLeft += parseInt(e.detail.height)
    // console.log(heightLeft)
  },

  waterfallImageRight(e) {
    heightRight += parseInt(e.detail.height)
    // console.log(heightRight)
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
              if (res.data.data.get_sesame_status == 1) {
                wx.showModal({
                  title: '恭喜你获得1000芝麻粒',
                  content: '1000芝麻粒=10元现金',
                  cancelText: '确认',
                  confirmText: '查看',
                  success(res) {
                    if (res.confirm) wx.navigateTo({ url: '../mission/mission' })
                  }
                })
              }
              wx.setStorageSync('qrop', res.data.data);
              that.setData({
                isShow: false,
              })
            }
          }
        })
      }
    })
  },

  onShow () {
    var that = this;
    // 判断新老用户(服务器端是否有数据)
    setTimeout(function () {
      wx.getStorageSync('qrop') != '' ? that.setData({ isShow: false }) : that.setData({ isShow: true })
    }, 300)
  },

  // 初始
  LunchOrigin(sort) {
    var that = this;
    let type;
    wx.getStorageSync('userLocation') != '' ? type = 1 : type = 0;
    wx.request({
      url: `https://kanjia.bigclient.cn/api/api/${articleList}`,
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id,
        latitude: wx.getStorageSync('userLocation').latitude,
        longitude: wx.getStorageSync('userLocation').longitude,
        type,
        sort: sort,
        p: 1
      },
      success(res) {
        if (res.data.code == 0) {
          that.setData({ presetDistance: 1})
          let dataLength = Math.ceil(res.data.data.length / 2)
          for (let j = 0; j < res.data.data.length; j++) {
            // 截取首图
            res.data.data[j].imgurl = res.data.data[j].imgurl.split(',')[0];
          }
          sort == 1 ? that.setData({ articleList: res.data.data }) : that.setData({ articleList_bak: res.data.data }) 
          setTimeout(() => {
            wx.hideLoading();
            wx.hideNavigationBarLoading();
            that.setData({ loadComplete: true })
            wx.stopPullDownRefresh();
          }, 50)
        } else {
          that.setData({ loadComplete: true })
          wx.hideLoading();
          wx.hideNavigationBarLoading();
          if (wx.getStorageSync('qrop') != '') wx.reLaunch({ url: '../commit/commit' })
        }
      },
      fail () {
        wx.reLaunch({
          url: '../commit/commit',
        })
      }
    })
  },

  scrolling (e) {
    var that = this;
    if (isBeRefresh == true) {
      if(e.detail.scrollTop <= -100) {
        that.setData({ refreshNow: true });
      }
      if (e.detail.scrollTop == 0 && that.data.refreshNow == true) {
        that.setData({ refreshNow: false });
        page = 1;
        wx.showNavigationBarLoading();
        that.LunchOrigin(sort);
      }
    }
  },

  //触顶事件
  reFresh(e) {
    var that = this;
    if(wx.getStorageSync('systemInfo').platform == 'ios'){
      if (e.detail.direction == 'top') {
        isBeRefresh = true;
      }
    }
  },

  // 触底事件
  beDownTrigger (e) {
    var that = this;
    if(e.detail.direction == 'bottom') {
      page++
      that.LunchMore(sort)
    }
  },

  // 分页
  LunchMore(sort) {
    var that = this;
    var query = wx.createSelectorQuery();
    let type;
    wx.getStorageSync('userLocation') != '' ? type = 1 : type = 0;
    wx.request({
      url: `https://kanjia.bigclient.cn/api/api/${articleList}`,
      method: 'POST',
      data: {
        user_id: wx.getStorageSync('qrop').id,
        latitude: wx.getStorageSync('userLocation').latitude,
        longitude: wx.getStorageSync('userLocation').longitude,
        type,
        sort: sort,
        p: page
      },
      success(res) {
        if (res.data.code == 0) {
          isBeRefresh = false;
          let dataLength = Math.ceil(res.data.data.length / 2);
          let isTail = res.data.data;
          for (let j = 0; j < res.data.data.length; j++) {
            // 截取首图
            res.data.data[j].imgurl = res.data.data[j].imgurl.split(',')[0];
          }
          if (sort == 1) {
            that.setData({
              articleList: that.data.articleList.concat(res.data.data)
            })
          }else {
            that.setData({
              articleList_bak: that.data.articleList_bak.concat(res.data.data)
            })
          }
          if (isTail == '') wx.showToast({
            title: '到底啦',
            icon: 'none',
            duration: 1500
          })
        } else {
          wx.showToast({
            title: '网络异常请重试',
            icon: 'none'
          })
        }
      }
    })
  },

  // onReachBottom() {
  //   var that = this;
  //   page++
  //   that.LunchMore(sort)
  // },

  // newBeeToLook() {
  //   wx.navigateTo({
  //     url: '../mission/mission',
  //   })
  //   this.setData({ newCustomer: false })
  // },

  recommand() {
    this.setData({ clickNo: 1, current: 0 })
    sort = 1;
    if(this.data.articleList == '') this.LunchOrigin(sort)
  },

  distance() {
    this.setData({ clickNo: 2, current: 1 })
    sort = 2;
    if (this.data.articleList_bak == '') this.LunchOrigin(sort)
  },

  //点击关闭弹出框
  close_share_popup () {
    wx.reLaunch({
      url: '../commit/commit',
    })
  },

  toDetail(e) {
    wx.navigateTo({
      url: '../zhimajiDetail/zhimajiDetail?id=' + e.currentTarget.id,
    })
  },

  onUnload (){
    page = 1;
    sort =1;
  },

  // 芝麻记发布
  toRelease() {
    wx.navigateTo({
      url: '../zhimaji/zhimaji',
    })
  },

  bingoTest () {
    
  },

  bingo(e) {
    var that = this;
    for (let j = 0; j < that.data.articleList.length; j++) {
      if (that.data.articleList[j].id == e.currentTarget.id) {
        that.data.articleList[j].status = !that.data.articleList[j].status;
        if (that.data.articleList[j].status == 1) {
          that.data.articleList[j].num++
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
          that.data.articleList[j].num--
        }
      }
    }
    this.setData({ articleList: that.data.articleList })
  }
})