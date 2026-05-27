const api = require('../../utils/api')

Page({
  data: {
    announcements: [],
    feedbacks: [],
    logs: [],
    showAnnForm: false,
    annForm: { title: '', content: '' },
    replyTexts: {}
  },

  onLoad() {
    this.loadAll()
  },

  async loadAll() {
    try {
      const [r1, r2, r3] = await Promise.all([
        api.getAdminAnnouncements(),
        api.getAdminFeedbacks(),
        api.getAdminLogs()
      ])
      if (r1.code === 200) this.setData({ announcements: r1.data })
      if (r2.code === 200) this.setData({ feedbacks: r2.data })
      if (r3.code === 200) this.setData({ logs: r3.data })
    } catch (e) {
      console.error(e)
    }
  },

  showAnnouncementForm() {
    this.setData({ showAnnForm: true, annForm: { title: '', content: '' } })
  },

  hideAnnouncementForm() {
    this.setData({ showAnnForm: false })
  },

  stopPropagation() {},

  onAnnInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`annForm.${field}`]: e.detail.value })
  },

  async submitAnnouncement() {
    if (!this.data.annForm.title || !this.data.annForm.content) {
      wx.showToast({ title: '请填写完整', icon: 'none' })
      return
    }
    try {
      await api.createAnnouncement(this.data.annForm)
      this.setData({ showAnnForm: false })
      this.loadAll()
      wx.showToast({ title: '发布成功' })
    } catch (e) {
      wx.showToast({ title: '发布失败', icon: 'none' })
    }
  },

  async deleteAnnouncement(e) {
    wx.showModal({
      title: '确认删除',
      content: '确定删除此公告？',
      success: async (res) => {
        if (res.confirm) {
          await api.deleteAnnouncement(e.currentTarget.dataset.id)
          this.loadAll()
        }
      }
    })
  },

  onReplyInput(e) {
    const id = e.currentTarget.dataset.id
    this.data.replyTexts[id] = e.detail.value
  },

  async replyFeedback(e) {
    const item = e.currentTarget.dataset.item
    const reply = this.data.replyTexts[item.id]
    if (!reply || !reply.trim()) {
      wx.showToast({ title: '请输入回复', icon: 'none' })
      return
    }
    try {
      await api.replyFeedback(item.id, { reply })
      this.loadAll()
      wx.showToast({ title: '回复成功' })
    } catch (e) {
      wx.showToast({ title: '回复失败', icon: 'none' })
    }
  }
})
