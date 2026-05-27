const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()

exports.main = async (event, context) => {
  const { action, data } = event

  switch (action) {
    case 'clothes': return await clothesStats(data)
    case 'style': return await styleStats(data)
    default: return { code: 400, message: '未知操作' }
  }
}

async function clothesStats(data) {
  const { userId } = data
  const { data: allClothes } = await db.collection('clothes')
    .where({ user_id: userId }).limit(200).get()

  const byCategory = {}, bySeason = {}, byColor = {}
  allClothes.forEach(c => {
    byCategory[c.category] = (byCategory[c.category] || 0) + 1
    bySeason[c.season] = (bySeason[c.season] || 0) + 1
    byColor[c.color] = (byColor[c.color] || 0) + 1
  })

  const toArr = obj => Object.entries(obj).map(([k, v]) => ({ category: k, season: k, color: k, count: v }))
  const mostWorn = [...allClothes].sort((a, b) => (b.wear_count || 0) - (a.wear_count || 0)).slice(0, 5)
  const leastWorn = allClothes.filter(c => (c.wear_count || 0) <= 2).slice(0, 5)
  const favoriteCount = allClothes.filter(c => c.is_favorite).length

  return {
    code: 200,
    data: {
      byCategory: Object.entries(byCategory).map(([category, count]) => ({ category, count })),
      bySeason: Object.entries(bySeason).map(([season, count]) => ({ season, count })),
      byColor: Object.entries(byColor).map(([color, count]) => ({ color, count })).sort((a, b) => b.count - a.count).slice(0, 8),
      mostWorn, leastWorn, total: allClothes.length, favoriteCount
    }
  }
}

async function styleStats(data) {
  const { userId } = data
  const { data: allOutfits } = await db.collection('outfits')
    .where({ user_id: userId }).limit(200).get()

  const styleCount = {}, occasionCount = {}, monthlyCount = {}
  allOutfits.forEach(o => {
    if (o.style) styleCount[o.style] = (styleCount[o.style] || 0) + 1
    if (o.occasion) occasionCount[o.occasion] = (occasionCount[o.occasion] || 0) + 1
    const dateStr = o.created_at ? (typeof o.created_at === 'string' ? o.created_at : new Date(o.created_at).toISOString()) : ''
    const month = dateStr.substring(0, 7)
    if (month) monthlyCount[month] = (monthlyCount[month] || 0) + 1
  })

  return {
    code: 200,
    data: {
      outfits: Object.entries(styleCount).map(([style, count]) => ({ style, count })).sort((a, b) => b.count - a.count),
      occasions: Object.entries(occasionCount).map(([occasion, count]) => ({ occasion, count })).sort((a, b) => b.count - a.count),
      monthlyOutfits: Object.entries(monthlyCount).map(([month, count]) => ({ month, count })).sort((a, b) => b.month < a.month ? -1 : 1).slice(-6)
    }
  }
}
