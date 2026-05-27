const api = require('../../utils/api')
const store = require('../../utils/store')

Page({
  data: {
    shares: [],
    showPublish: false,
    styleFilter: '',
    occasionFilter: '',
    styleTags: ['简约', '甜美', '日系', '法式', '极简', '知性', '运动', '街头'],
    occasionTags: ['日常', '通勤', '约会', '正式', '休闲', '运动'],
    pubForm: { images: '', content: '', style_tags: '', occasion_tags: '', visibility: 'public' },
    sortBy: 'latest'
  },

  setSortBy(e) {
    const sortBy = e.currentTarget.dataset.val
    this.setData({ sortBy })
    this.loadShares()
  },

  async borrowOutfit(e) {
    const s = e.currentTarget.dataset.item
    const tags = (s.style_tags || '').split(',').filter(Boolean)
    try {
      await api.saveOutfit({
        user_id: store.getUserId(),
        title: '借鉴：' + s.nickname + '的穿搭',
        occasion: (s.occasion_tags || '').split(',')[0] || '日常',
        weather: '', season: '', style: tags[0] || '借鉴',
        items: [], is_auto: 0, is_public: 0
      })
      wx.showToast({ title: '已借鉴到穿搭库' })
    } catch (e) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },


  onLoad() {
    this.loadShares()
  },

  onShow() {
    this.loadShares()
  },

  onPullDownRefresh() {
    this.loadShares()
    wx.stopPullDownRefresh()
  },

  async loadShares() {
    const params = {}
    if (this.data.styleFilter) params.style = this.data.styleFilter
    if (this.data.occasionFilter) params.occasion = this.data.occasionFilter
    try {
      const res = await api.getShares(params)
      if (res.code === 200) {
        let shares = res.data
        if (this.data.sortBy === 'hot') {
          shares = shares.sort((a, b) => (b.likes_count + b.collects_count) - (a.likes_count + a.collects_count))
        }
        this.setData({ shares })
      }
    } catch (e) {
      console.error(e)
    }
  },

  setStyleFilter(e) {
    this.setData({ styleFilter: e.currentTarget.dataset.val })
    this.loadShares()
  },

  setOccasionFilter(e) {
    this.setData({ occasionFilter: e.currentTarget.dataset.val })
    this.loadShares()
  },

  showPublishModal() {
    this.setData({ showPublish: true })
  },

  hidePublish() {
    this.setData({ showPublish: false })
  },

  stopPropagation() {},

  onPubInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`pubForm.${field}`]: e.detail.value })
  },

  onVisibility(e) {
    this.setData({ 'pubForm.visibility': e.detail.value == 0 ? 'public' : 'private' })
  },

  takePubPhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success: (res) => {
        this.setData({ 'pubForm.images': res.tempFiles[0].tempFilePath })
      }
    })
  },

  choosePubImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        this.setData({ 'pubForm.images': res.tempFiles[0].tempFilePath })
      }
    })
  },

  previewPubImage() {
    if (this.data.pubForm.images) {
      wx.previewImage({ urls: [this.data.pubForm.images] })
    }
  },

  async doPublish() {
    if (!this.data.pubForm.content) {
      wx.showToast({ title: '请填写描述', icon: 'none' })
      return
    }
    try {
      const res = await api.createShare({ ...this.data.pubForm, user_id: store.getUserId() })
      this.setData({
        showPublish: false,
        pubForm: { images: '', content: '', style_tags: '', occasion_tags: '', visibility: 'public' }
      })
      this.loadShares()
      wx.showToast({
        title: (res && res.message) || '发布成功',
        icon: 'none',
        duration: 2500
      })
    } catch (e) {
      wx.showToast({ title: '发布失败', icon: 'none' })
    }
  }
})
