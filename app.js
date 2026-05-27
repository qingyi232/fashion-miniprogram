App({
  globalData: {
    userInfo: null,
    baseUrl: 'http://localhost:3001/api',
    useCloud: true
  },

  onLaunch() {
    if (this.globalData.useCloud) {
      wx.cloud.init({
        env: 'cloud1-d2gcgfjfn24988a22',
        traceUser: true
      })
    }

    const userInfo = wx.getStorageSync('fashion_user')
    if (userInfo) {
      this.globalData.userInfo = userInfo
    }
  }
})
