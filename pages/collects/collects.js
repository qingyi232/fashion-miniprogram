const api = require('../../utils/api')
const store = require('../../utils/store')

Page({
  data: {
    loading: true,
    loadError: '',
    collects: []
  },

  onShow() {
    this.loadCollects()
  },

  onPullDownRefresh() {
    this.loadCollects().finally(() => wx.stopPullDownRefresh())
  },

  async loadCollects() {
    const uid = store.getUserId()
    if (!uid) {
      this.setData({ loading: false, loadError: '请先登录', collects: [] })
      return
    }
    this.setData({ loading: true, loadError: '' })
    try {
      const res = await api.getCollects(uid)
      if (res.code === 200) {
        this.setData({ collects: res.data || [], loading: false, loadError: '' })
      } else {
        this.setData({ loading: false, loadError: res.message || '加载失败' })
      }
    } catch (e) {
      console.error(e)
      this.setData({ loading: false, loadError: '网络异常，请下拉重试' })
    }
  },

  goSquare() {
    wx.switchTab({ url: '/pages/share/share' })
  }
})
