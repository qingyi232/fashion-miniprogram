const api = require('../../utils/api')

Page({
  data: {
    reviews: [],
    statusFilter: 'pending'
  },

  onLoad() {
    this.loadReviews()
  },

  async loadReviews() {
    const params = {}
    if (this.data.statusFilter) params.status = this.data.statusFilter
    try {
      const res = await api.getAdminReviews(params)
      if (res.code === 200) this.setData({ reviews: res.data })
    } catch (e) {
      console.error(e)
    }
  },

  setFilter(e) {
    this.setData({ statusFilter: e.currentTarget.dataset.val })
    this.loadReviews()
  },

  async approveReview(e) {
    try {
      await api.updateReview(e.currentTarget.dataset.id, 'approved')
      this.loadReviews()
      wx.showToast({ title: '已通过' })
    } catch (e) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  async rejectReview(e) {
    try {
      await api.updateReview(e.currentTarget.dataset.id, 'rejected')
      this.loadReviews()
      wx.showToast({ title: '已驳回' })
    } catch (e) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  }
})
