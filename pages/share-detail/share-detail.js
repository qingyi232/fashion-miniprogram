const api = require('../../utils/api')
const store = require('../../utils/store')

Page({
  data: {
    share: null,
    allTags: [],
    mainComments: [],
    commentText: '',
    replyTo: null,
    replyText: '',
    shareId: '',
    actionLoading: false
  },

  onLoad(options) {
    this.data.shareId = options.id
    this.loadDetail()
  },

  async loadDetail() {
    const uid = store.getUserId()
    try {
      const res = await api.getShareDetail(this.data.shareId, uid)
      if (res.code === 403) {
        wx.showToast({ title: res.message || '暂不可查看', icon: 'none' })
        setTimeout(() => wx.navigateBack(), 1500)
        return
      }
      if (res.code === 200) {
        const share = res.data
        const allTags = [...(share.style_tags || '').split(','), ...(share.occasion_tags || '').split(',')].filter(Boolean)
        const comments = share.comments || []
        const mainComments = comments.filter(c => !c.parent_id).map(c => ({
          ...c,
          replies: comments.filter(r => r.parent_id === (c.id || c._id))
        }))
        this.setData({ share, allTags, mainComments })
      }
    } catch (e) {
      console.error(e)
      wx.showToast({ title: '加载失败', icon: 'none' })
    }
  },

  ensureLogin() {
    if (!store.getUserId()) {
      wx.showToast({ title: '请先登录', icon: 'none' })
      return false
    }
    return true
  },

  async doLike() {
    if (!this.ensureLogin() || this.data.actionLoading) return
    this.setData({ actionLoading: true })
    try {
      const res = await api.likeShare(this.data.shareId, store.getUserId())
      if (res.code === 200 && res.data) {
        const liked = res.data.liked
        const share = { ...this.data.share }
        const delta = liked ? 1 : -1
        share.liked = liked
        share.likes_count = Math.max(0, (share.likes_count || 0) + delta)
        this.setData({ share })
        wx.showToast({ title: liked ? '已点赞' : '已取消点赞', icon: 'none' })
      }
    } catch (e) {
      console.error(e)
      wx.showToast({ title: '操作失败', icon: 'none' })
    } finally {
      this.setData({ actionLoading: false })
    }
  },

  async doCollect() {
    if (!this.ensureLogin() || this.data.actionLoading) return
    this.setData({ actionLoading: true })
    try {
      const res = await api.collectShare(this.data.shareId, store.getUserId())
      if (res.code === 200 && res.data) {
        const collected = res.data.collected
        const share = { ...this.data.share }
        const delta = collected ? 1 : -1
        share.collected = collected
        share.collects_count = Math.max(0, (share.collects_count || 0) + delta)
        this.setData({ share })
        wx.showToast({ title: collected ? '已收藏' : '已取消收藏', icon: 'none' })
      }
    } catch (e) {
      console.error(e)
      wx.showToast({ title: '操作失败', icon: 'none' })
    } finally {
      this.setData({ actionLoading: false })
    }
  },

  onCommentInput(e) {
    this.setData({ commentText: e.detail.value })
  },

  async doComment() {
    if (!this.ensureLogin()) return
    if (!this.data.commentText.trim()) return
    try {
      await api.commentShare(this.data.shareId, { user_id: store.getUserId(), content: this.data.commentText })
      this.setData({ commentText: '' })
      this.loadDetail()
      wx.showToast({ title: '评论成功' })
    } catch (e) {
      wx.showToast({ title: '评论失败', icon: 'none' })
    }
  },

  toggleReply(e) {
    const id = e.currentTarget.dataset.id
    this.setData({ replyTo: this.data.replyTo === id ? null : id, replyText: '' })
  },

  onReplyInput(e) {
    this.setData({ replyText: e.detail.value })
  },

  async doReply(e) {
    if (!this.ensureLogin()) return
    if (!this.data.replyText.trim()) return
    const parent = e.currentTarget.dataset.parent
    try {
      await api.commentShare(this.data.shareId, {
        user_id: store.getUserId(),
        content: this.data.replyText,
        parent_id: parent.id || parent._id
      })
      this.setData({ replyText: '', replyTo: null })
      this.loadDetail()
      wx.showToast({ title: '回复成功' })
    } catch (e) {
      wx.showToast({ title: '回复失败', icon: 'none' })
    }
  }
})
