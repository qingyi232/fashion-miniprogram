const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { action, data } = event

  switch (action) {
    case 'list': return await listClothes(data)
    case 'add': return await addClothes(data)
    case 'update': return await updateClothes(data)
    case 'delete': return await deleteClothes(data)
    case 'toggleFavorite': return await toggleFavorite(data)
    case 'recordWear': return await recordWear(data)
    default: return { code: 400, message: '未知操作' }
  }
}

async function listClothes(data) {
  const { user_id, category, season, occasion, color, keyword } = data || {}
  let query = db.collection('clothes')
  const conditions = {}

  if (user_id) conditions.user_id = user_id
  if (category) conditions.category = category
  if (season) conditions.season = _.in([season, '四季'])
  if (occasion) conditions.occasion = occasion
  if (color) conditions.color = db.RegExp({ regexp: color, options: 'i' })

  if (Object.keys(conditions).length) query = query.where(conditions)

  const { data: clothes } = await query.orderBy('created_at', 'desc').limit(100).get()

  const normalize = items => items.map(c => ({ ...c, id: c._id }))

  if (keyword) {
    const kw = keyword.toLowerCase()
    return { code: 200, data: normalize(clothes.filter(c => c.name.toLowerCase().includes(kw) || (c.brand && c.brand.toLowerCase().includes(kw)))) }
  }

  return { code: 200, data: normalize(clothes) }
}

async function addClothes(data) {
  const { user_id, name, category, season, occasion, color, brand, image } = data
  const res = await db.collection('clothes').add({
    data: {
      user_id, name, category, season: season || '', occasion: occasion || '',
      color: color || '', brand: brand || '', image: image || '',
      is_favorite: 0, wear_count: 0, last_worn: null, created_at: db.serverDate()
    }
  })
  return { code: 200, data: { id: res._id }, message: '添加成功' }
}

async function updateClothes(data) {
  const { id, _id, name, category, season, occasion, color, brand, image, is_favorite } = data
  const docId = id || _id
  if (!docId) return { code: 400, message: '缺少衣物ID' }
  await db.collection('clothes').doc(docId).update({
    data: { name, category, season, occasion, color, brand, image, is_favorite: is_favorite ? 1 : 0 }
  })
  return { code: 200, message: '更新成功' }
}

async function deleteClothes(data) {
  const docId = data.id || data._id
  if (!docId) return { code: 400, message: '缺少衣物ID' }
  await db.collection('clothes').doc(docId).remove()
  return { code: 200, message: '删除成功' }
}

async function toggleFavorite(data) {
  const docId = data.id || data._id
  if (!docId) return { code: 400, message: '缺少衣物ID' }
  const { data: item } = await db.collection('clothes').doc(docId).get()
  const newFav = item.is_favorite ? 0 : 1
  await db.collection('clothes').doc(docId).update({ data: { is_favorite: newFav } })
  return { code: 200, data: { is_favorite: newFav } }
}

async function recordWear(data) {
  const docId = data.id || data._id
  if (!docId) return { code: 400, message: '缺少衣物ID' }
  await db.collection('clothes').doc(docId).update({
    data: { wear_count: _.inc(1), last_worn: new Date().toISOString().split('T')[0] }
  })
  return { code: 200, message: '记录穿着' }
}
