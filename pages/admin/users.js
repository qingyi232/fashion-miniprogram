const api = require('../../utils/api')

Page({
  data: {
    users: []
  },

  onLoad() {
    this.loadUsers()
  },

  async loadUsers() {
    try {
      const res = await api.getAdminUsers()
      if (res.code === 200) this.setData({ users: res.data })
    } catch (e) {
      console.error(e)
    }
  },

  async toggleStatus(e) {
    const item = e.currentTarget.dataset.item
    const newStatus = item.status === 'active' ? 'disabled' : 'active'
    try {
      await api.updateUserStatus(item.id, newStatus)
      this.loadUsers()
      wx.showToast({ title: newStatus === 'active' ? '已启用' : '已禁用' })
    } catch (e) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  }
})
