const app = getApp()

function getBaseUrl() {
  return app.globalData.baseUrl
}

function useCloud() {
  return app.globalData.useCloud
}

function callCloud(name, action, data) {
  return new Promise((resolve, reject) => {
    wx.cloud.callFunction({
      name,
      data: { action, data },
      success(res) {
        resolve(res.result)
      },
      fail(err) {
        console.error('云函数调用失败:', name, action, err)
        reject(err)
      }
    })
  })
}

function request(url, options = {}) {
  return new Promise((resolve, reject) => {
    wx.request({
      url: getBaseUrl() + url,
      method: options.method || 'GET',
      data: options.data || {},
      header: {
        'Content-Type': 'application/json',
        ...options.header
      },
      success(res) {
        resolve(res.data)
      },
      fail(err) {
        console.error('请求失败:', url, err)
        reject(err)
      }
    })
  })
}

module.exports = {
  login: (openid) => {
    if (useCloud()) return callCloud('user', 'login', { openid })
    return request('/login', { method: 'POST', data: { openid } })
  },
  getUser: (id) => {
    if (useCloud()) return callCloud('user', 'getUser', { id })
    return request('/users/' + id)
  },
  updateUser: (id, data) => {
    if (useCloud()) return callCloud('user', 'updateUser', { id, ...data })
    return request('/users/' + id, { method: 'PUT', data })
  },

  getClothes: (params) => {
    if (useCloud()) return callCloud('clothes', 'list', params)
    return request('/clothes?' + objectToQuery(params))
  },
  addClothes: (data) => {
    if (useCloud()) return callCloud('clothes', 'add', data)
    return request('/clothes', { method: 'POST', data })
  },
  updateClothes: (id, data) => {
    if (useCloud()) return callCloud('clothes', 'update', { id, ...data })
    return request('/clothes/' + id, { method: 'PUT', data })
  },
  deleteClothes: (id) => {
    if (useCloud()) return callCloud('clothes', 'delete', { id })
    return request('/clothes/' + id, { method: 'DELETE' })
  },
  toggleFavorite: (id) => {
    if (useCloud()) return callCloud('clothes', 'toggleFavorite', { id })
    return request('/clothes/' + id + '/favorite', { method: 'PUT' })
  },
  recordWear: (id) => {
    if (useCloud()) return callCloud('clothes', 'recordWear', { id })
    return request('/clothes/' + id + '/wear', { method: 'PUT' })
  },

  getOutfits: (params) => {
    if (useCloud()) return callCloud('outfit', 'list', params)
    return request('/outfits?' + objectToQuery(params))
  },
  saveOutfit: (data) => {
    if (useCloud()) return callCloud('outfit', 'save', data)
    return request('/outfits', { method: 'POST', data })
  },
  deleteOutfit: (id) => {
    if (useCloud()) return callCloud('outfit', 'delete', { id })
    return request('/outfits/' + id, { method: 'DELETE' })
  },
  generateOutfits: (data) => {
    if (useCloud()) return callCloud('outfit', 'generate', data)
    return request('/outfits/generate', { method: 'POST', data })
  },

  getShares: (params) => {
    if (useCloud()) return callCloud('share', 'list', params)
    return request('/shares?' + objectToQuery(params || {}))
  },
  getShareDetail: (id, user_id) => {
    if (useCloud()) return callCloud('share', 'detail', { id, user_id })
    const q = user_id ? '?user_id=' + encodeURIComponent(user_id) : ''
    return request('/shares/' + id + q)
  },
  getCollects: (user_id) => {
    if (useCloud()) return callCloud('share', 'listCollects', { user_id })
    return request('/users/' + user_id + '/collects')
  },
  createShare: (data) => {
    if (useCloud()) return callCloud('share', 'create', data)
    return request('/shares', { method: 'POST', data })
  },
  deleteShare: (id) => {
    if (useCloud()) return callCloud('share', 'delete', { id })
    return request('/shares/' + id, { method: 'DELETE' })
  },
  likeShare: (id, user_id) => {
    if (useCloud()) return callCloud('share', 'like', { id, user_id })
    return request('/shares/' + id + '/like', { method: 'POST', data: { user_id } })
  },
  collectShare: (id, user_id) => {
    if (useCloud()) return callCloud('share', 'collect', { id, user_id })
    return request('/shares/' + id + '/collect', { method: 'POST', data: { user_id } })
  },
  commentShare: (id, data) => {
    if (useCloud()) return callCloud('share', 'comment', { share_id: id, ...data })
    return request('/shares/' + id + '/comment', { method: 'POST', data })
  },

  getClothesStats: (userId) => {
    if (useCloud()) return callCloud('stats', 'clothes', { userId })
    return request('/stats/clothes/' + userId)
  },
  getStyleStats: (userId) => {
    if (useCloud()) return callCloud('stats', 'style', { userId })
    return request('/stats/style/' + userId)
  },

  getAdminUsers: () => {
    if (useCloud()) return callCloud('admin', 'getUsers', {})
    return request('/admin/users')
  },
  getAdminStats: () => {
    if (useCloud()) return callCloud('admin', 'getStats', {})
    return request('/admin/stats')
  },
  getAdminReviews: (params) => {
    if (useCloud()) return callCloud('admin', 'getReviews', params)
    return request('/admin/reviews?' + objectToQuery(params || {}))
  },
  updateReview: (id, status) => {
    if (useCloud()) return callCloud('admin', 'updateReview', { id, status })
    return request('/admin/reviews/' + id, { method: 'PUT', data: { status } })
  },
  batchDeleteReviews: (ids) => {
    if (useCloud()) return callCloud('admin', 'batchDeleteReviews', { ids })
    return request('/admin/reviews/batch-delete', { method: 'POST', data: { ids } })
  },
  updateUserStatus: (id, status) => {
    if (useCloud()) return callCloud('admin', 'updateUserStatus', { id, status })
    return request('/admin/users/' + id + '/status', { method: 'PUT', data: { status } })
  },
  getAdminAnnouncements: () => {
    if (useCloud()) return callCloud('admin', 'getAnnouncements', {})
    return request('/admin/announcements')
  },
  createAnnouncement: (data) => {
    if (useCloud()) return callCloud('admin', 'createAnnouncement', data)
    return request('/admin/announcements', { method: 'POST', data })
  },
  deleteAnnouncement: (id) => {
    if (useCloud()) return callCloud('admin', 'deleteAnnouncement', { id })
    return request('/admin/announcements/' + id, { method: 'DELETE' })
  },
  getAdminFeedbacks: () => {
    if (useCloud()) return callCloud('admin', 'getFeedbacks', {})
    return request('/admin/feedbacks')
  },
  replyFeedback: (id, data) => {
    if (useCloud()) return callCloud('admin', 'replyFeedback', { id, ...data })
    return request('/admin/feedbacks/' + id, { method: 'PUT', data })
  },
  getAdminLogs: () => {
    if (useCloud()) return callCloud('admin', 'getLogs', {})
    return request('/admin/logs')
  },
  getActiveAnnouncements: () => {
    if (useCloud()) return callCloud('admin', 'getActiveAnnouncements', {})
    return request('/announcements/active')
  },
  submitFeedback: (data) => {
    if (useCloud()) return callCloud('admin', 'submitFeedback', data)
    return request('/feedbacks', { method: 'POST', data })
  },

  uploadImage: (filePath) => {
    if (useCloud()) {
      return new Promise((resolve, reject) => {
        const cloudPath = `clothes/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.jpg`
        wx.cloud.uploadFile({
          cloudPath,
          filePath,
          success(res) { resolve({ code: 200, data: { url: res.fileID } }) },
          fail(err) { reject(err) }
        })
      })
    }
    return Promise.resolve({ code: 200, data: { url: filePath } })
  }
}

function objectToQuery(obj) {
  if (!obj) return ''
  return Object.keys(obj)
    .filter(k => obj[k] !== undefined && obj[k] !== '')
    .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]))
    .join('&')
}
