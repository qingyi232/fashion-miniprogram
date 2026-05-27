const KEY = 'fashion_user'

module.exports = {
  getUser() {
    try {
      return wx.getStorageSync(KEY) || null
    } catch (e) {
      return null
    }
  },

  setUser(user) {
    const app = getApp()
    app.globalData.userInfo = user
    wx.setStorageSync(KEY, user)
  },

  getUserId() {
    const user = this.getUser()
    return user ? (user._id || user.id) : null
  },

  isLoggedIn() {
    return !!this.getUser()
  },

  isAdmin() {
    const user = this.getUser()
    return user && user.role === 'admin'
  },

  logout() {
    const app = getApp()
    app.globalData.userInfo = null
    wx.removeStorageSync(KEY)
  }
}
