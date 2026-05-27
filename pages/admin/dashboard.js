const api = require('../../utils/api')

Page({
  data: {
    stats: { recentUsers: [] }
  },

  onLoad() {
    this.loadStats()
  },

  async loadStats() {
    try {
      const res = await api.getAdminStats()
      if (res.code === 200) {
        const stats = res.data
        if (stats.recentUsers) {
          stats.recentUsers = stats.recentUsers.map(u => ({
            ...u,
            created_at: u.created_at ? new Date(u.created_at).toLocaleString('zh-CN') : '-'
          }))
        }
        this.setData({ stats })
      }
    } catch (e) {
      console.error(e)
    }
  }
})
