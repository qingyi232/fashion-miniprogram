const api = require('../../utils/api')
const store = require('../../utils/store')

Page({
  data: {
    loading: true,
    loadError: '',
    clothesData: { byCategory: [], bySeason: [], byColor: [], mostWorn: [], leastWorn: [] },
    styleData: [],
    occasionData: [],
    outfitCount: 0,
    occasionCount: 0
  },

  onLoad() {
    this.loadData()
  },

  onPullDownRefresh() {
    this.loadData().finally(() => wx.stopPullDownRefresh())
  },

  async loadData() {
    const uid = store.getUserId()
    if (!uid) {
      this.setData({ loading: false, loadError: '请先登录后查看数据' })
      return
    }
    this.setData({ loading: true, loadError: '' })
    try {
      const [r1, r2] = await Promise.all([api.getClothesStats(uid), api.getStyleStats(uid)])
      if (r1.code === 200) {
        const d = r1.data
        const maxCat = Math.max(...(d.byCategory || []).map(a => a.count || 0), 1)
        const maxSea = Math.max(...(d.bySeason || []).map(a => a.count || 0), 1)
        if (d.byCategory) d.byCategory.forEach(i => { i.percent = Math.round((i.count / maxCat) * 100) })
        if (d.bySeason) d.bySeason.forEach(i => { i.percent = Math.round((i.count / maxSea) * 100) })
        this.setData({ clothesData: d })
      }
      if (r2.code === 200) {
        const styles = r2.data.outfits || []
        const occasions = r2.data.occasions || []
        const maxStyle = Math.max(...styles.map(a => a.count || 0), 1)
        styles.forEach(i => { i.percent = Math.round((i.count / maxStyle) * 100) })
        this.setData({
          styleData: styles,
          occasionData: occasions,
          outfitCount: styles.reduce((s, i) => s + (i.count || 0), 0),
          occasionCount: occasions.length
        })
      }
      this.setData({ loading: false })
    } catch (e) {
      console.error('加载统计数据失败', e)
      this.setData({ loading: false, loadError: '加载失败，请下拉重试' })
    }
  },

  goWardrobe() {
    wx.switchTab({ url: '/pages/wardrobe/wardrobe' })
  },

  goMatch() {
    wx.switchTab({ url: '/pages/match/match' })
  }
})
