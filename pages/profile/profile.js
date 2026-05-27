const api = require('../../utils/api')
const store = require('../../utils/store')

Page({
  data: {
    isLoggedIn: false,
    isAdmin: false,
    profile: {},
    showEdit: false,
    showFeedback: false,
    showAbout: false,
    editForm: { nickname: '', avatar: '', gender: '', phone: '', bio: '' },
    feedbackForm: { type: 'suggestion', content: '' }
  },

  onShow() {
    const user = store.getUser()
    if (!user) {
      this.setData({ isLoggedIn: false, isAdmin: false, profile: {} })
      return
    }
    this.setData({
      isLoggedIn: true,
      isAdmin: user.role === 'admin',
      profile: user
    })
    this.loadProfile()
  },

  async loadProfile() {
    const userId = store.getUserId()
    if (!userId) return
    try {
      const res = await api.getUser(userId)
      if (res.code === 200 && res.data) {
        const d = res.data
        store.setUser(d)
        this.setData({
          profile: d,
          isAdmin: d.role === 'admin',
          editForm: { nickname: d.nickname, avatar: d.avatar, gender: d.gender, phone: d.phone, bio: d.bio }
        })
      }
    } catch (e) {
      console.error(e)
    }
  },

  showEditModal() {
    this.setData({ showEdit: true })
  },

  hideEdit() {
    this.setData({ showEdit: false })
  },

  stopPropagation() {},

  onEditInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`editForm.${field}`]: e.detail.value })
  },

  onGenderChange(e) {
    const arr = ['男', '女', '保密']
    this.setData({ 'editForm.gender': arr[e.detail.value] })
  },

  async saveProfile() {
    try {
      await api.updateUser(store.getUserId(), this.data.editForm)
      const user = store.getUser()
      store.setUser({ ...user, ...this.data.editForm })
      this.setData({ showEdit: false })
      this.loadProfile()
      wx.showToast({ title: '保存成功' })
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  showFeedbackModal() {
    this.setData({ showFeedback: true })
  },

  hideFeedback() {
    this.setData({ showFeedback: false })
  },

  onFeedbackType(e) {
    const types = ['suggestion', 'complaint']
    this.setData({ 'feedbackForm.type': types[e.detail.value] })
  },

  onFeedbackContent(e) {
    this.setData({ 'feedbackForm.content': e.detail.value })
  },

  async submitFeedback() {
    if (!this.data.feedbackForm.content.trim()) {
      wx.showToast({ title: '请填写反馈内容', icon: 'none' })
      return
    }
    try {
      await api.submitFeedback({ user_id: store.getUserId(), ...this.data.feedbackForm })
      this.setData({ showFeedback: false, 'feedbackForm.content': '' })
      wx.showToast({ title: '感谢您的反馈' })
    } catch (e) {
      wx.showToast({ title: '提交失败', icon: 'none' })
    }
  },

  showAboutModal() {
    this.setData({ showAbout: true })
  },

  hideAbout() {
    this.setData({ showAbout: false })
  },

  doLogout() {
    wx.showModal({
      title: '退出登录',
      content: '确定退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          store.logout()
          this.setData({ isLoggedIn: false, isAdmin: false, profile: {} })
          wx.reLaunch({ url: '/pages/login/login' })
        }
      }
    })
  },

  doDeactivate() {
    wx.showModal({
      title: '注销账号',
      content: '确定要注销账号吗？此操作不可恢复，所有数据将被清除。',
      success: (res) => {
        if (res.confirm) {
          wx.showModal({
            title: '再次确认',
            content: '注销后无法恢复，确定继续？',
            success: (res2) => {
              if (res2.confirm) {
                store.logout()
                wx.showToast({ title: '账号已注销' })
                wx.reLaunch({ url: '/pages/login/login' })
              }
            }
          })
        }
      }
    })
  }
})
