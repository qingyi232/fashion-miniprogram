const BASE = '/api'

async function request(url, options = {}) {
  const res = await fetch(BASE + url, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined
  })
  return res.json()
}

export const login = (openid) => request('/login', { method: 'POST', body: { openid } })
export const getUser = (id) => request(`/users/${id}`)
export const updateUser = (id, data) => request(`/users/${id}`, { method: 'PUT', body: data })

export const getClothes = (params) => request('/clothes?' + new URLSearchParams(params))
export const addClothes = (data) => request('/clothes', { method: 'POST', body: data })
export const updateClothes = (id, data) => request(`/clothes/${id}`, { method: 'PUT', body: data })
export const deleteClothes = (id) => request(`/clothes/${id}`, { method: 'DELETE' })
export const toggleFavorite = (id) => request(`/clothes/${id}/favorite`, { method: 'PUT' })
export const recordWear = (id) => request(`/clothes/${id}/wear`, { method: 'PUT' })

export const getOutfits = (params) => request('/outfits?' + new URLSearchParams(params))
export const saveOutfit = (data) => request('/outfits', { method: 'POST', body: data })
export const deleteOutfit = (id) => request(`/outfits/${id}`, { method: 'DELETE' })
export const generateOutfits = (data) => request('/outfits/generate', { method: 'POST', body: data })

export const getShares = (params) => request('/shares?' + new URLSearchParams(params || {}))
export const getShareDetail = (id) => request(`/shares/${id}`)
export const createShare = (data) => request('/shares', { method: 'POST', body: data })
export const deleteShare = (id) => request(`/shares/${id}`, { method: 'DELETE' })
export const likeShare = (id, user_id) => request(`/shares/${id}/like`, { method: 'POST', body: { user_id } })
export const collectShare = (id, user_id) => request(`/shares/${id}/collect`, { method: 'POST', body: { user_id } })
export const commentShare = (id, data) => request(`/shares/${id}/comment`, { method: 'POST', body: data })

export const getClothesStats = (userId) => request(`/stats/clothes/${userId}`)
export const getStyleStats = (userId) => request(`/stats/style/${userId}`)

export const getAdminUsers = () => request('/admin/users')
export const getAdminStats = () => request('/admin/stats')
export const getAdminReviews = (params) => request('/admin/reviews?' + new URLSearchParams(params || {}))
export const updateReview = (id, status) => request(`/admin/reviews/${id}`, { method: 'PUT', body: { status } })
export const batchDeleteReviews = (ids) => request('/admin/reviews/batch-delete', { method: 'POST', body: { ids } })
export const updateUserStatus = (id, status) => request(`/admin/users/${id}/status`, { method: 'PUT', body: { status } })
export const exportUsers = () => request('/admin/users/export')
export const getAdminAnnouncements = () => request('/admin/announcements')
export const createAnnouncement = (data) => request('/admin/announcements', { method: 'POST', body: data })
export const deleteAnnouncement = (id) => request(`/admin/announcements/${id}`, { method: 'DELETE' })
export const getAdminFeedbacks = () => request('/admin/feedbacks')
export const replyFeedback = (id, data) => request(`/admin/feedbacks/${id}`, { method: 'PUT', body: data })
export const getAdminLogs = () => request('/admin/logs')
export const getActiveAnnouncements = () => request('/announcements/active')
