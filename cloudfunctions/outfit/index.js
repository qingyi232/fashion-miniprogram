const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { action, data } = event

  switch (action) {
    case 'list': return await listOutfits(data)
    case 'save': return await saveOutfit(data)
    case 'delete': return await deleteOutfit(data)
    case 'generate': return await generateOutfits(data)
    default: return { code: 400, message: '未知操作' }
  }
}

async function listOutfits(data) {
  const { user_id, occasion, style } = data || {}
  const conditions = {}
  if (user_id) conditions.user_id = user_id
  if (occasion) conditions.occasion = occasion
  if (style) conditions.style = style

  const { data: outfits } = await db.collection('outfits')
    .where(conditions).orderBy('created_at', 'desc').limit(50).get()

  outfits.forEach(o => {
    if (typeof o.items === 'string') o.items = JSON.parse(o.items)
  })
  return { code: 200, data: outfits }
}

async function saveOutfit(data) {
  const { user_id, title, occasion, weather, season, style, items, is_auto, is_public } = data
  const res = await db.collection('outfits').add({
    data: {
      user_id, title, occasion: occasion || '', weather: weather || '',
      season: season || '', style: style || '', items,
      is_auto: is_auto ? 1 : 0, is_public: is_public ? 1 : 0,
      created_at: db.serverDate()
    }
  })
  return { code: 200, data: { id: res._id }, message: '保存成功' }
}

async function deleteOutfit(data) {
  await db.collection('outfits').doc(data.id).remove()
  return { code: 200, message: '删除成功' }
}

// ========== 智能搭配算法：规则引擎 + 协同过滤 ==========
async function generateOutfits(data) {
  const { user_id, occasion, weather, season } = data
  if (!user_id) return { code: 400, message: '缺少用户ID' }

  const { data: allClothes } = await db.collection('clothes')
    .where({ user_id }).limit(200).get()

  if (allClothes.length < 2) return { code: 200, data: [], message: '衣物数量不足' }

  // === 规则引擎：基于衣物属性的多维度搭配规则 ===

  const seasonMap = {
    '春季': ['春秋', '春季', '四季'],
    '夏季': ['夏季', '四季'],
    '秋季': ['春秋', '秋季', '四季'],
    '冬季': ['冬季', '四季']
  }

  const colorHarmony = {
    '白色': ['黑色', '蓝色', '米色', '粉色', '卡其色', '灰色', '深蓝', '奶茶色'],
    '黑色': ['白色', '灰色', '红色', '粉色', '蓝白', '卡其色', '黑红'],
    '蓝色': ['白色', '米色', '黑色', '蓝白', '灰色'],
    '粉色': ['白色', '米色', '灰色', '米白', '黑色'],
    '米色': ['白色', '棕色', '蓝色', '深蓝', '卡其色', '奶茶色'],
    '灰色': ['白色', '黑色', '粉色', '蓝色', '深蓝'],
    '卡其色': ['白色', '黑色', '棕色', '米色', '深蓝', '军绿'],
    '奶茶色': ['米白', '白色', '棕色', '米色', '灰色'],
    '军绿': ['白色', '黑色', '黑红', '棕色', '卡其色'],
    '蓝白': ['黑色', '蓝色', '米色', '白色', '卡其色'],
    '米白': ['奶茶色', '粉色', '棕色', '灰色', '蓝色'],
    '深蓝': ['白色', '米色', '灰色', '卡其色'],
    '棕色': ['白色', '米色', '卡其色', '奶茶色', '军绿'],
    '碎花': ['白色', '米色', '米白', '棕色'],
    '黑红': ['黑色', '白色', '军绿', '灰色'],
    '酒红': ['黑色', '白色', '米色', '灰色'],
    '裸粉': ['白色', '米白', '米色', '灰色']
  }

  const occasionStyle = {
    '日常': ['休闲', '极简', '日系', '街头'],
    '通勤': ['知性', '简约', '优雅', '都市'],
    '约会': ['甜美', '法式', '温柔', '浪漫'],
    '正式': ['知性', '优雅', '经典', '商务'],
    '运动': ['运动', '活力', '街头', '休闲'],
    '休闲': ['休闲', '极简', '街头', '日系']
  }

  const weatherColorPrefer = {
    '晴天': ['白色', '粉色', '蓝色', '米色', '碎花', '浅蓝', '米白', '奶茶色', '裸粉'],
    '阴天': ['灰色', '黑色', '深蓝', '军绿', '卡其色', '棕色', '酒红'],
    '雨天': ['黑色', '深蓝', '灰色', '军绿', '卡其色'],
    '大风': ['黑色', '灰色', '深蓝', '军绿', '卡其色', '棕色']
  }

  const needOuter = weather === '阴天' || weather === '雨天' || weather === '大风' || season === '冬季' || season === '秋季'

  function seasonMatch(itemSeason) {
    if (!season) return 1
    const matched = seasonMap[season] || [season, '四季']
    if (itemSeason === season) return 3
    if (itemSeason === '四季') return 1.5
    if (matched.includes(itemSeason)) return 2
    return 0
  }

  function occasionMatch(itemOccasion) {
    if (!occasion) return 1
    if (itemOccasion === occasion) return 3
    if (itemOccasion === '日常') return 1
    return 0.3
  }

  function colorScore(c1, c2) {
    const harmonious = colorHarmony[c1] || []
    if (harmonious.includes(c2)) return 3
    if (c1 === c2) return 1.2
    return 1.5
  }

  function weatherColorBonus(color) {
    if (!weather) return 0
    const preferred = weatherColorPrefer[weather] || []
    return preferred.includes(color) ? 5 : 0
  }

  // === 协同过滤算法：基于用户行为的个性化推荐 ===

  let cfCategoryPrefer = {}
  let cfColorPrefer = {}
  let cfStyles = []

  try {
    const { data: similarOutfits } = await db.collection('outfits')
      .where({ user_id: _.neq(user_id), occasion: occasion || '日常' })
      .orderBy('created_at', 'desc').limit(20).get()

    const cfItemIds = []
    similarOutfits.forEach(o => {
      const ids = Array.isArray(o.items) ? o.items : (typeof o.items === 'string' ? JSON.parse(o.items) : [])
      cfItemIds.push(...ids)
    })

    if (cfItemIds.length) {
      const { data: cfItems } = await db.collection('clothes')
        .where({ _id: _.in(cfItemIds) }).limit(100).get()
      cfItems.forEach(it => {
        cfCategoryPrefer[it.category] = (cfCategoryPrefer[it.category] || 0) + 1
        cfColorPrefer[it.color] = (cfColorPrefer[it.color] || 0) + 1
      })
    }

    const styleCount = {}
    similarOutfits.forEach(o => {
      if (o.style) styleCount[o.style] = (styleCount[o.style] || 0) + 1
    })
    cfStyles = Object.entries(styleCount).sort((a, b) => b[1] - a[1]).map(e => e[0])
  } catch (e) {}

  const { data: userHistory } = await db.collection('outfits')
    .where({ user_id }).orderBy('created_at', 'desc').limit(10).get()

  const frequentItemIds = {}
  userHistory.forEach(o => {
    const ids = Array.isArray(o.items) ? o.items : (typeof o.items === 'string' ? JSON.parse(o.items) : [])
    ids.forEach(id => { frequentItemIds[id] = (frequentItemIds[id] || 0) + 1 })
  })

  function itemScore(item) {
    let score = 0
    score += seasonMatch(item.season) * 8
    score += occasionMatch(item.occasion) * 10
    score += weatherColorBonus(item.color)
    if (item.is_favorite) score += 3
    score += Math.min(item.wear_count || 0, 8) * 0.5
    if (frequentItemIds[item._id]) score += frequentItemIds[item._id] * 1.5
    if (cfCategoryPrefer[item.category]) score += Math.min(cfCategoryPrefer[item.category], 5)
    if (cfColorPrefer[item.color]) score += Math.min(cfColorPrefer[item.color], 4)
    return score
  }

  const filteredClothes = allClothes.filter(c => seasonMatch(c.season) > 0)
  if (filteredClothes.length < 2) return { code: 200, data: [], message: '该季节衣物不足' }

  const categories = { '上衣': [], '裤装': [], '裙装': [], '外套': [], '鞋子': [], '包包': [], '配饰': [] }
  filteredClothes.forEach(c => { if (categories[c.category]) categories[c.category].push(c) })

  const tops = categories['上衣']
  const bottoms = [...categories['裤装'], ...categories['裙装']]
  const shoes = categories['鞋子']
  const outers = categories['外套']
  const bags = categories['包包']

  if (!tops.length || !bottoms.length) return { code: 200, data: [], message: '上衣或下装不足，无法生成搭配' }

  const allCombos = []
  for (const top of tops) {
    for (const bottom of bottoms) {
      let score = itemScore(top) + itemScore(bottom)
      score += colorScore(top.color, bottom.color) * 8
      if (top.occasion === occasion && bottom.occasion === occasion) score += 15
      else if (top.occasion === occasion || bottom.occasion === occasion) score += 8
      score += (Math.random() * 6 - 3)
      allCombos.push({ top, bottom, score })
    }
  }

  allCombos.sort((a, b) => b.score - a.score)

  const schemes = []
  const usedTops = new Set()
  const usedBottoms = new Set()

  for (const combo of allCombos) {
    if (schemes.length >= 3) break
    if (schemes.length > 0 && usedTops.has(combo.top._id) && usedBottoms.has(combo.bottom._id)) continue
    if (schemes.length >= 2 && (usedTops.has(combo.top._id) || usedBottoms.has(combo.bottom._id))) continue

    usedTops.add(combo.top._id)
    usedBottoms.add(combo.bottom._id)

    const idx = schemes.length
    const shoe = shoes.length ? shoes.reduce((best, s) => {
      const sc = itemScore(s) + colorScore(combo.top.color, s.color) * 3 + (Math.random() * 2)
      return sc > best.sc ? { item: s, sc } : best
    }, { item: shoes[0], sc: -1 }).item : null

    const outer = outers.length && needOuter ? outers.reduce((best, o) => {
      const sc = itemScore(o) + colorScore(combo.top.color, o.color) * 3 + (Math.random() * 2)
      return sc > best.sc ? { item: o, sc } : best
    }, { item: outers[0], sc: -1 }).item : null

    const bag = bags.length ? bags[idx % bags.length] : null
    const items = [combo.top, combo.bottom, shoe, outer, bag].filter(Boolean)

    const styles = occasionStyle[occasion] || occasionStyle['日常']
    let style = styles[0]
    if (cfStyles.length && idx === 0) style = cfStyles[0]
    else if (idx < styles.length) style = styles[idx]

    schemes.push({
      title: `${occasion || '日常'}穿搭方案 ${idx + 1}`,
      items: items.map(it => it._id),
      itemDetails: items,
      occasion: occasion || '日常',
      weather: weather || '晴天',
      season: season || '春季',
      style,
      matchScore: Math.round(combo.score),
      algorithm: idx < 2 ? '规则引擎+协同过滤' : '规则引擎'
    })
  }

  if (!schemes.length) return { code: 200, data: [], message: '无法生成匹配的搭配方案' }

  await db.collection('logs').add({
    data: {
      action: '智能搭配',
      detail: `为用户生成${schemes.length}套${occasion || '日常'}搭配方案(${season || '春季'}/${weather || '晴天'})`,
      operator: 'system', created_at: db.serverDate()
    }
  })

  return { code: 200, data: schemes }
}
