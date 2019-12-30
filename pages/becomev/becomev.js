Page({
  data: {
    empty: ''
  },

  //表单提交
  becomeV (e) {
    var that = this;
    let content =e.detail.value;
    if (content.nickname && content.wechat && content.district && content.level && content.fans != ''){
      if (content.introduce !=''){
        content.introduce.length < 50 ? wx.showToast({ title: '填写的自述小于50字', icon: 'none' }) : that.Infomation(content)
      }else {
        that.Infomation(content)
      }
    }else {
      wx.showToast({
        title: '请填写必填项！',
        icon: 'none'
      })
    }
  },

  copy () {
    wx.setClipboardData({
      data: 'zhimajun_2019',
      success(res) {
        wx.getClipboardData({
          success(res) {
            
          }
        })
      }
    })
  },

  Infomation (n) {
    var that = this;
    wx.showLoading({
      title: '提交中，请等待',
      mask: true
    })
    wx.request({
      url: 'https://kanjia.bigclient.cn//api/api/vipInvite',
      method: 'POST',
      data: {
        nickname: n.nickname,
        wechat: n.wechat,
        district: n.district,
        level: n.level,
        fans_num: n.fans,
        hobby: n.introduce
      },
      success (res) {
        if(res.data.code == 0){
          wx.hideLoading()
          wx.showToast({
            title: '提交成功！',
            mask: true
          })
          setTimeout( ()=> {
            wx.navigateBack({
              delta: 1
            })
          }, 1400)
          // that.setData({ empty: '' })
        }else {
          wx.hideLoading();
          wx.showToast({
            title: '网络异常请重试',
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

  onShareAppMessage: function () {

  }
})