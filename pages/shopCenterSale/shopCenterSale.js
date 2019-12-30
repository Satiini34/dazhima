var interval;
var time;
var touchDotX = 0;//触摸时的原点 
// import YrobotTouch from "../../utils/YrobotTouch"; //引入YrobotTouch
Page({
  data: {
    choice: '',
    deal_: [],
    checked_: [],
    uncheck_: [],
    expire_ :[],
    dealShow: false,
    checkedShow: false,
    uncheckShow: false,
    expireShow: false,
    amountShow: ''
  },

  onLoad: function (options) {
    var that = this;
    this.setData({ 
      choice: options.id,
      amountShow: wx.getStorageSync('shopCenter').is_withdraw
    }) 
    let deal_ = wx.getStorageSync('shop_deal').all;
    let checked_ = wx.getStorageSync('shop_deal').checked;
    let uncheck_ = wx.getStorageSync('shop_deal').unchecked;
    let expire_ = wx.getStorageSync('shop_deal').expired;
    if(deal_.length !=0 ) {
      that.setData({ dealShow: true })
      for (let i = 0; i < deal_.length; i++) {
        deal_[i].nickname.length >= 14 ? deal_[i].nickname = deal_[i].nickname.slice(0, 14) : deal_[i].nickname = deal_[i].nickname;
      }
    }else {
      that.setData({ dealShow: false })
    } 
    if(checked_.length != 0 ) {
      that.setData({ checkedShow: true })
      for (let j = 0; j < checked_.length; j++) {
        checked_[j].nickname.length >= 14 ? checked_[j].nickname = checked_[j].nickname.slice(0, 14) : checked_[j].nickname = checked_[j].nickname
      }
    } else {
      that.setData({ checkedShow: false })
    } 
    if (uncheck_.length != 0 ){
      that.setData({ uncheckShow: true })
      for (let k = 0; k < uncheck_.length; k++) {
        uncheck_[k].nickname.length >= 14 ? uncheck_[k].nickname = uncheck_[k].nickname.slice(0, 14) : uncheck_[k].nickname = uncheck_[k].nickname
      }
    } else {
      that.setData({ uncheckShow: false })
    } 
    if (expire_.length != 0) {
      that.setData({ expireShow: true })
      for (let l = 0; l < expire_.length; l++) {
        expire_[l].nickname.length >= 14 ? expire_[l].nickname = expire_[l].nickname.slice(0, 14) : expire_[l].nickname = expire_[l].nickname
      }
    } else {
      that.setData({ expireShow: false })
    } 
    this.setData({
      deal_,
      checked_,
      uncheck_,
      expire_
    })
  },

  deal() {
    this.setData({
      choice: 1
    })
  },

  checked() {
    this.setData({
      choice: 2
    })
  },

  uncheck() {
    this.setData({
      choice: 3
    })
  },

  expire() {
    this.setData({
      choice: 4
    })
  },

  // 触摸移动事件 
  touchStart: function (e) {
    touchDotX = e.touches[0].pageX; // 获取触摸时的原点
    // 使用js计时器记录时间    
    interval = setInterval(() => {
      time++;
    }, 100);
  },
  // 触摸结束事件
  touchEnd: function (e) {
    var that = this;
    let touchMoveX = e.changedTouches[0].pageX;
    let tmX = touchMoveX - touchDotX;
    if (time < 20) {
      let absX = Math.abs(tmX);
      if (tmX < -60) {
        // con,sole.log("左滑=====")
        that.data.choice < 4 ? that.setData({ choice: parseInt(that.data.choice) + 1 }) : that.setData({ choice: 1 })
      }
      if (tmX > 60) {
        // console.log("右滑=====")
        that.data.choice > 1 ? that.setData({ choice: parseInt(that.data.choice) - 1 }) : that.setData({ choice: 4 })
      }
    }
    clearInterval(interval); // 清除setInterval
    time = 0;
  },
})