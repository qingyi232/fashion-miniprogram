const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { action, data } = event

  switch (action) {
    case 'getUsers': return await getUsers()
    case 'updateUserStatus': return await updateUserStatus(data)
    case 'getStats': return await getStats()
    case 'getReviews': return await getReviews(data)
    case 'updateReview': return await updateReview(data)
    case 'batchDeleteReviews': return await batchDeleteReviews(data)
    case 'getAnnouncements': return await getAnnouncements()
    case 'createAnnouncement': return await createAnnouncement(data)
    case 'deleteAnnouncement': return await deleteAnnouncement(data)
    case 'getFeedbacks': return await getFeedbacks()
    case 'replyFeedback': return await replyFeedback(data)
    case 'getLogs': return await getLogs()
    case 'getActiveAnnouncements': return await getActiveAnnouncements()
    case 'submitFeedback': return await submitFeedback(data)
    default: return { code: 400, message: '未知操作' }
  }
}

async function getUsers() {
  const { data: users } = await db.collection('users')
    .where({ role: 'user' }).orderBy('created_at', 'desc').limit(100).get()

  for (const u of users) {
    u.clothesCount = (await db.collection('clothes').where({ user_id: u._id }).count()).total
    u.sharesCount = (await db.collection('shares').where({ user_id: u._id }).count()).total
  }
  return { code: 200, data: users }
}

async function updateUserStatus(data) {
  const { id, status } = data
  const { data: user } = await db.collection('users').doc(id).get()
  await db.collection('users').doc(id).update({ data: { status } })
  await db.collection('logs').add({
    data: {
      action: '用户管理',
      detail: `${status === 'active' ? '启用' : '禁用'}用户 ${user.nickname}`,
      operator: 'admin', created_at: db.serverDate()
    }
  })
  return { code: 200, message: '操作成功' }
}

async function getStats() {
  const totalUsers = (await db.collection('users').where({ role: 'user' }).count()).total
  const totalClothes = (await db.collection('clothes').count()).total
  const totalShares = (await db.collection('shares').count()).total
  const totalOutfits = (await db.collection('outfits').count()).total
  const pendingReviews = (await db.collection('shares').where({ status: 'pending' }).count()).total
  const pendingFeedbacks = (await db.collection('feedbacks').where({ status: 'pending' }).count()).total

  const { data: recentUsers } = await db.collection('users')
    .where({ role: 'user' }).orderBy('created_at', 'desc').limit(5).get()

  return { code: 200, data: { totalUsers, totalClothes, totalShares, totalOutfits, pendingReviews, pendingFeedbacks, recentUsers } }
}

async function getReviews(data) {
  const conditions = {}
  if (data && data.status) conditions.status = data.status

  const { data: shares } = await db.collection('shares')
    .where(conditions).orderBy('created_at', 'desc').limit(50).get()

  const userIds = [...new Set(shares.map(s => s.user_id))]
  let userMap = {}
  if (userIds.length) {
    const { data: users } = await db.collection('users').where({ _id: _.in(userIds) }).get()
    users.forEach(u => { userMap[u._id] = u })
  }
  shares.forEach(s => {
    const u = userMap[s.user_id] || {}
    s.nickname = u.nickname || ''
    s.avatar = u.avatar || ''
    s.id = s._id
  })
  return { code: 200, data: shares }
}

async function updateReview(data) {
  const { id, status } = data
  await db.collection('shares').doc(id).update({ data: { status } })
  await db.collection('logs').add({
    data: { action: '内容审核', detail: `穿搭 #${id} 状态更新为 ${status}`, operator: 'admin', created_at: db.serverDate() }
  })
  return { code: 200, message: '操作成功' }
}

async function batchDeleteReviews(data) {
  const { ids } = data
  if (!ids || !ids.length) return { code: 400, message: '缺少ID列表' }

  for (const id of ids) {
    await db.collection('comments').where({ share_id: id }).remove()
    await db.collection('likes').where({ share_id: id }).remove()
    await db.collection('collects').where({ share_id: id }).remove()
    await db.collection('shares').doc(id).remove()
  }
  await db.collection('logs').add({
    data: { action: '批量删除', detail: `批量删除 ${ids.length} 条违规穿搭`, operator: 'admin', created_at: db.serverDate() }
  })
  return { code: 200, message: `已删除 ${ids.length} 条内容` }
}

async function getAnnouncements() {
  const { data } = await db.collection('announcements').orderBy('created_at', 'desc').limit(20).get()
  return { code: 200, data }
}

async function createAnnouncement(data) {
  await db.collection('announcements').add({
    data: { title: data.title, content: data.content, is_active: 1, created_at: db.serverDate() }
  })
  return { code: 200, message: '发布成功' }
}

async function deleteAnnouncement(data) {
  await db.collection('announcements').doc(data.id).remove()
  return { code: 200, message: '删除成功' }
}

async function getFeedbacks() {
  const { data: feedbacks } = await db.collection('feedbacks')
    .orderBy('created_at', 'desc').limit(50).get()

  const userIds = [...new Set(feedbacks.map(f => f.user_id))]
  let userMap = {}
  if (userIds.length) {
    const { data: users } = await db.collection('users').where({ _id: _.in(userIds) }).get()
    users.forEach(u => { userMap[u._id] = u })
  }
  feedbacks.forEach(f => {
    const u = userMap[f.user_id] || {}
    f.nickname = u.nickname || ''
    f.avatar = u.avatar || ''
  })
  return { code: 200, data: feedbacks }
}

async function replyFeedback(data) {
  const { id, reply, status } = data
  await db.collection('feedbacks').doc(id).update({ data: { reply, status: status || 'replied' } })
  return { code: 200, message: '回复成功' }
}

async function getLogs() {
  const { data } = await db.collection('logs').orderBy('created_at', 'desc').limit(50).get()
  return { code: 200, data }
}

async function getActiveAnnouncements() {
  const { data } = await db.collection('announcements').where({ is_active: 1 }).orderBy('created_at', 'desc').get()
  return { code: 200, data }
}

async function submitFeedback(data) {
  const { user_id, type, content } = data
  if (!content) return { code: 400, message: '内容不能为空' }
  await db.collection('feedbacks').add({
    data: { user_id, type: type || 'suggestion', content, status: 'pending', reply: '', created_at: db.serverDate() }
  })
  await db.collection('logs').add({
    data: { action: '用户反馈', detail: `用户提交了${type === 'complaint' ? '投诉' : '建议'}`, operator: 'user', created_at: db.serverDate() }
  })
  return { code: 200, message: '提交成功' }
}
