const api = require('../../utils/api')
const store = require('../../utils/store')

Page({
  data: {
    users: [
      { openid: 'wx_user_001', name: '林小鹿', avatar: 'https://picsum.photos/seed/user_deer/100/100', roleLabel: '普通用户 · 时尚达人' },
      { openid: 'wx_user_002', name: '陈一帆', avatar: 'https://picsum.photos/seed/user_fan/100/100', roleLabel: '普通用户 · 极简主义' },
      { openid: 'wx_user_003', name: '苏晚晴', avatar: 'https://picsum.photos/seed/user_qing/100/100', roleLabel: '普通用户 · 日系博主' },
      { openid: 'wx_user_004', name: '周子墨', avatar: 'https://picsum.photos/seed/user_mo/100/100', roleLabel: '普通用户 · 街头潮流' },
      { openid: 'wx_user_005', name: '沈悦然', avatar: 'https://picsum.photos/seed/user_ran/100/100', roleLabel: '普通用户 · 法式穿搭' },
      { openid: 'wx_admin_001', name: '管理员', avatar: 'https://picsum.photos/seed/user_admin/100/100', roleLabel: '系统管理员' }
    ]
  },

  async doLogin(e) {
    const openid = e.currentTarget.dataset.openid
    wx.showLoading({ title: '登录中...' })
    try {
      const res = await api.login(openid)
      if (res.code === 200) {
        store.setUser(res.data)
        wx.hideLoading()
        if (res.data.role === 'admin') {
          wx.redirectTo({ url: '/pages/admin/dashboard' })
        } else {
          wx.switchTab({ url: '/pages/home/home' })
        }
      } else {
        wx.hideLoading()
        wx.showToast({ title: '登录失败', icon: 'none' })
      }
    } catch (e) {
      wx.hideLoading()
      wx.showToast({ title: '网络错误', icon: 'none' })
    }
  }
})
