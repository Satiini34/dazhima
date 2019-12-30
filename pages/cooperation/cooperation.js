Page({
  codeSubmit (e) {
    let formId = e.detail.formId;
    let city = e.detail.value.city;
    let contact_name = e.detail.value.contact_name;
    let mobile = e.detail.value.mobile;
    let wechat = e.detail.value.wechat;
    let shop_name = e.detail.value.shop_name;
    let remarks = e.detail.value.remarks;
    let phonePatter = /^1[3456789]\d{9}$/;
    if (phonePatter.test(mobile) == true){
      if (city && contact_name && wechat != ''){
        wx.showLoading({
          title: '提交中',
          mask: true
        })
        wx.request({
          url: 'https://kanjia.bigclient.cn/api/api/shopApplication',
          method: 'POST',
          data: {
            city: city,
            contact_name: contact_name,
            wechat: wechat,
            shop_name: shop_name,
            remarks: remarks,
            mobile: mobile
          },
          success (res) {
            wx.hideLoading()
            if (res.data.code == 0) {
              wx.showToast({
                title: '申请成功',
                mask: true
              })
              setTimeout( ()=>{
                wx.switchTab({
                  url: '../mine/mine',
                })
              },1000)
            }else {
              wx.hideLoading()
              wx.showToast({
                title: '网络异常请重试',
                icon: 'none',
                mask: true
              })
            }
          },
          fail () {
            wx.hideLoading()
            wx.showToast({
              title: '网络异常请重试',
              icon: 'none',
              mask: true
            })
          }
        })
      }else{
        wx.showToast({
          title: '请填写必填项',
          icon:'none'
        })
      }
    }else{
      wx.showToast({
        title: '请填写正确的手机号',
        icon:'none'
      })
    }
  },
})