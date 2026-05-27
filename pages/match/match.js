const api = require('../../utils/api')
const store = require('../../utils/store')

Page({
  data: {
    mode: 'auto',
    loading: false,
    schemes: [],
    savedOutfits: [],
    occasions: ['日常', '通勤', '约会', '正式', '运动', '休闲'],
    weathers: ['晴天', '阴天', '雨天', '大风'],
    seasonList: ['春季', '夏季', '秋季', '冬季'],
    categories: ['上衣', '裤装', '裙装', '外套', '鞋子', '包包', '配饰'],
    params: { occasion: '日常', weather: '晴天', season: '春季' },
    occasionIdx: 0,
    weatherIdx: 0,
    seasonIdx: 0,
    allClothes: [],
    manualSelected: [],
    selectedDetails: [],
    manualFilter: '',
    manualTitle: '',
    manualOccasion: '日常',
    manualPublic: 0
  },

  onLoad() {
    this.loadSaved()
  },

  onShow() {
    this.loadSaved()
  },

  switchMode(e) {
    const mode = e.currentTarget.dataset.mode
    this.setData({ mode })
    if (mode === 'manual') this.loadAllClothes()
  },

  onOccasionChange(e) {
    this.setData({ occasionIdx: e.detail.value, 'params.occasion': this.data.occasions[e.detail.value] })
  },

  onWeatherChange(e) {
    this.setData({ weatherIdx: e.detail.value, 'params.weather': this.data.weathers[e.detail.value] })
  },

  onSeasonChange(e) {
    this.setData({ seasonIdx: e.detail.value, 'params.season': this.data.seasonList[e.detail.value] })
  },

  async generate() {
    if (this.data.loading) return
    this.setData({ loading: true, schemes: [] })
    try {
      const res = await api.generateOutfits({ user_id: store.getUserId(), ...this.data.params })
      if (res.code === 200) {
        this.setData({ schemes: res.data || [] })
        if (!res.data || res.data.length === 0) {
          wx.showToast({ title: res.message || '暂无匹配方案，请先添加衣物', icon: 'none', duration: 2500 })
        }
      } else {
        wx.showToast({ title: res.message || '生成失败', icon: 'none' })
      }
    } catch (e) {
      wx.showToast({ title: '生成失败，请检查网络', icon: 'none' })
    }
    this.setData({ loading: false })
  },

  async saveScheme(e) {
    const s = e.currentTarget.dataset.scheme
    try {
      await api.saveOutfit({
        user_id: store.getUserId(),
        title: s.title, occasion: s.occasion, weather: s.weather,
        season: s.season, style: s.style, items: s.items, is_auto: 1, is_public: 0
      })
      this.loadSaved()
      wx.showToast({ title: '保存成功' })
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  async loadSaved() {
    try {
      const res = await api.getOutfits({ user_id: store.getUserId() })
      if (res.code === 200) this.setData({ savedOutfits: res.data })
    } catch (e) {
      console.error(e)
    }
  },

  async loadAllClothes() {
    const p = { user_id: store.getUserId() }
    if (this.data.manualFilter) p.category = this.data.manualFilter
    try {
      const res = await api.getClothes(p)
      if (res.code === 200) this.setData({ allClothes: res.data })
    } catch (e) {
      console.error(e)
    }
  },

  onManualFilter(e) {
    const idx = e.detail.value
    const arr = [''].concat(this.data.categories)
    this.setData({ manualFilter: arr[idx] })
    this.loadAllClothes()
  },

  toggleManualSelect(e) {
    const item = e.currentTarget.dataset.item
    let selected = this.data.manualSelected.slice()
    const idx = selected.indexOf(item.id)
    if (idx >= 0) selected.splice(idx, 1)
    else selected.push(item.id)
    const details = this.data.allClothes.filter(c => selected.includes(c.id))
    this.setData({ manualSelected: selected, selectedDetails: details })
  },

  removeManual(e) {
    const id = e.currentTarget.dataset.id
    const selected = this.data.manualSelected.filter(i => i !== id)
    const details = this.data.allClothes.filter(c => selected.includes(c.id))
    this.setData({ manualSelected: selected, selectedDetails: details })
  },

  onManualTitle(e) {
    this.setData({ manualTitle: e.detail.value })
  },

  onManualOccasion(e) {
    this.setData({ manualOccasion: this.data.occasions[e.detail.value] })
  },

  onManualPublic(e) {
    this.setData({ manualPublic: parseInt(e.detail.value) })
  },

  async saveManual() {
    if (!this.data.manualSelected.length || !this.data.manualTitle) {
      wx.showToast({ title: '请选择衣物并填写名称', icon: 'none' })
      return
    }
    try {
      await api.saveOutfit({
        user_id: store.getUserId(),
        title: this.data.manualTitle, occasion: this.data.manualOccasion,
        weather: '', season: '', style: '手动',
        items: this.data.manualSelected, is_auto: 0, is_public: this.data.manualPublic
      })
      this.setData({ manualSelected: [], selectedDetails: [], manualTitle: '' })
      this.loadSaved()
      wx.showToast({ title: '保存成功' })
    } catch (e) {
      wx.showToast({ title: '保存失败', icon: 'none' })
    }
  },

  async removeOutfit(e) {
    const item = e.currentTarget.dataset.item
    wx.showModal({
      title: '确认删除',
      content: '确定删除该搭配方案？',
      success: async (res) => {
        if (res.confirm) {
          await api.deleteOutfit(item.id)
          this.loadSaved()
        }
      }
    })
  }
})
