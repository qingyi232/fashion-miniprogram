const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { action, data } = event

  switch (action) {
    case 'list': return await listShares(data)
    case 'detail': return await getDetail(data)
    case 'create': return await createShare(data)
    case 'delete': return await deleteShare(data)
    case 'like': return await likeShare(data)
    case 'collect': return await collectShare(data)
    case 'listCollects': return await listCollects(data)
    case 'comment': return await addComment(data)
    default: return { code: 400, message: '未知操作' }
  }
}

async function listShares(data) {
  const { user_id, style, occasion, status } = data || {}
  const conditions = {}

  if (user_id) conditions.user_id = user_id
  if (style) conditions.style_tags = db.RegExp({ regexp: style, options: 'i' })
  if (occasion) conditions.occasion_tags = db.RegExp({ regexp: occasion, options: 'i' })

  if (status) {
    conditions.status = status
  } else {
    conditions.visibility = 'public'
    conditions.status = 'approved'
  }

  const { data: shares } = await db.collection('shares')
    .where(conditions).orderBy('created_at', 'desc').limit(50).get()

  const userIds = [...new Set(shares.map(s => s.user_id))]
  let userMap = {}
  if (userIds.length) {
    const { data: users } = await db.collection('users')
      .where({ _id: _.in(userIds) }).get()
    users.forEach(u => { userMap[u._id] = u })
  }

  shares.forEach(s => {
    const u = userMap[s.user_id] || {}
    s.nickname = u.nickname || ''
    s.avatar = u.avatar || ''
  })

  return { code: 200, data: shares }
}

async function getDetail(data) {
  if (!data || !data.id) return { code: 400, message: '缺少分享ID' }
  const { data: share } = await db.collection('shares').doc(data.id).get()
  if (!share) return { code: 404, message: '内容不存在' }

  if (share.status !== 'approved') {
    const viewerId = data.user_id
    if (!viewerId || share.user_id !== viewerId) {
      return { code: 403, message: '内容审核中或未通过，暂不可查看' }
    }
  }

  const { data: userArr } = await db.collection('users').where({ _id: share.user_id }).get()
  if (userArr.length) { share.nickname = userArr[0].nickname; share.avatar = userArr[0].avatar }

  const { data: comments } = await db.collection('comments')
    .where({ share_id: data.id }).orderBy('created_at', 'asc').limit(100).get()

  const commentUserIds = [...new Set(comments.map(c => c.user_id))]
  let commentUserMap = {}
  if (commentUserIds.length) {
    const { data: cUsers } = await db.collection('users')
      .where({ _id: _.in(commentUserIds) }).get()
    cUsers.forEach(u => { commentUserMap[u._id] = u })
  }
  comments.forEach(c => {
    const u = commentUserMap[c.user_id] || {}
    c.nickname = u.nickname || ''
    c.avatar = u.avatar || ''
    c.id = c._id
  })

  let liked = false
  let collected = false
  if (data.user_id) {
    const { data: likeRows } = await db.collection('likes')
      .where({ share_id: data.id, user_id: data.user_id }).limit(1).get()
    liked = likeRows.length > 0
    const { data: collectRows } = await db.collection('collects')
      .where({ share_id: data.id, user_id: data.user_id }).limit(1).get()
    collected = collectRows.length > 0
  }

  return { code: 200, data: { ...share, comments, liked, collected } }
}

async function listCollects(data) {
  const { user_id } = data || {}
  if (!user_id) return { code: 400, message: '缺少用户ID' }

  const { data: collects } = await db.collection('collects')
    .where({ user_id }).orderBy('created_at', 'desc').limit(50).get()

  if (!collects.length) return { code: 200, data: [] }

  const shareIds = [...new Set(collects.map(c => c.share_id))]
  const { data: shares } = await db.collection('shares').where({ _id: _.in(shareIds) }).get()
  const shareMap = {}
  shares.forEach(s => { shareMap[s._id] = s })

  const userIds = [...new Set(shares.map(s => s.user_id))]
  let userMap = {}
  if (userIds.length) {
    const { data: users } = await db.collection('users').where({ _id: _.in(userIds) }).get()
    users.forEach(u => { userMap[u._id] = u })
  }

  const list = collects
    .map(c => {
      const s = shareMap[c.share_id]
      if (!s || s.status !== 'approved') return null
      const u = userMap[s.user_id] || {}
      return {
        ...s,
        collect_id: c._id,
        collected_at: c.created_at,
        nickname: u.nickname || '',
        avatar: u.avatar || ''
      }
    })
    .filter(Boolean)

  return { code: 200, data: list }
}

async function createShare(data) {
  const { user_id, outfit_id, content, images, style_tags, occasion_tags, visibility } = data
  const vis = visibility || 'public'
  const status = vis === 'public' ? 'pending' : 'approved'
  const res = await db.collection('shares').add({
    data: {
      user_id, outfit_id: outfit_id || '', content: content || '',
      images: images || '', style_tags: style_tags || '', occasion_tags: occasion_tags || '',
      visibility: vis, status,
      likes_count: 0, comments_count: 0, collects_count: 0,
      created_at: db.serverDate()
    }
  })
  const message = status === 'pending'
    ? '已提交审核，管理员通过后将展示在广场'
    : '发布成功'
  return { code: 200, data: { id: res._id, status }, message }
}

async function assertShareApproved(shareId) {
  const { data: share } = await db.collection('shares').doc(shareId).get()
  if (!share) return { ok: false, code: 404, message: '内容不存在' }
  if (share.status !== 'approved') {
    return { ok: false, code: 403, message: '内容未通过审核，暂不可操作' }
  }
  return { ok: true, share }
}

async function deleteShare(data) {
  await db.collection('comments').where({ share_id: data.id }).remove()
  await db.collection('likes').where({ share_id: data.id }).remove()
  await db.collection('collects').where({ share_id: data.id }).remove()
  await db.collection('shares').doc(data.id).remove()
  return { code: 200, message: '删除成功' }
}

async function likeShare(data) {
  const { id, user_id } = data
  const check = await assertShareApproved(id)
  if (!check.ok) return { code: check.code, message: check.message }
  const { data: existing } = await db.collection('likes')
    .where({ share_id: id, user_id }).get()

  if (existing.length) {
    await db.collection('likes').doc(existing[0]._id).remove()
    await db.collection('shares').doc(id).update({ data: { likes_count: _.inc(-1) } })
    return { code: 200, data: { liked: false } }
  } else {
    await db.collection('likes').add({ data: { share_id: id, user_id, created_at: db.serverDate() } })
    await db.collection('shares').doc(id).update({ data: { likes_count: _.inc(1) } })
    return { code: 200, data: { liked: true } }
  }
}

async function collectShare(data) {
  const { id, user_id } = data
  const check = await assertShareApproved(id)
  if (!check.ok) return { code: check.code, message: check.message }
  const { data: existing } = await db.collection('collects')
    .where({ share_id: id, user_id }).get()

  if (existing.length) {
    await db.collection('collects').doc(existing[0]._id).remove()
    await db.collection('shares').doc(id).update({ data: { collects_count: _.inc(-1) } })
    return { code: 200, data: { collected: false } }
  } else {
    await db.collection('collects').add({ data: { share_id: id, user_id, created_at: db.serverDate() } })
    await db.collection('shares').doc(id).update({ data: { collects_count: _.inc(1) } })
    return { code: 200, data: { collected: true } }
  }
}

async function addComment(data) {
  const { share_id, user_id, content, parent_id } = data
  const check = await assertShareApproved(share_id)
  if (!check.ok) return { code: check.code, message: check.message }
  await db.collection('comments').add({
    data: { share_id, user_id, content, parent_id: parent_id || '', created_at: db.serverDate() }
  })
  await db.collection('shares').doc(share_id).update({ data: { comments_count: _.inc(1) } })
  return { code: 200, message: '评论成功' }
}
