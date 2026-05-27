const api = require('../../utils/api')
const store = require('../../utils/store')

Page({
  data: {
    clothes: [],
    showForm: false,
    editingItem: null,
    categories: ['上衣', '裤装', '裙装', '外套', '鞋子', '包包', '配饰'],
    seasons: ['春秋', '夏季', '冬季', '四季'],
    occasions: ['日常', '通勤', '约会', '正式', '运动', '休闲'],
    colors: ['白色', '黑色', '蓝色', '粉色', '米色', '灰色', '棕色', '红色', '绿色'],
    filter: { category: '', season: '', occasion: '', color: '' },
    form: { name: '', category: '上衣', season: '春秋', occasion: '日常', color: '', brand: '', image: '' },
    categoryIdx: 0,
    seasonIdx: 0,
    occasionIdx: 0
  },

  onLoad() {
    this.loadClothes()
  },

  onShow() {
    this.loadClothes()
  },

  onPullDownRefresh() {
    this.loadClothes()
    wx.stopPullDownRefresh()
  },

  async loadClothes() {
    const params = { user_id: store.getUserId() }
    const f = this.data.filter
    if (f.category) params.category = f.category
    if (f.season) params.season = f.season
    if (f.occasion) params.occasion = f.occasion
    if (f.color) params.color = f.color
    try {
      const res = await api.getClothes(params)
      if (res.code === 200) this.setData({ clothes: res.data })
    } catch (e) {
      console.error('加载衣物失败', e)
    }
  },

  onCategoryChange(e) {
    const idx = e.detail.value
    const arr = [''].concat(this.data.categories)
    this.setData({ 'filter.category': arr[idx] })
    this.loadClothes()
  },

  onSeasonChange(e) {
    const idx = e.detail.value
    const arr = [''].concat(this.data.seasons)
    this.setData({ 'filter.season': arr[idx] })
    this.loadClothes()
  },

  onOccasionChange(e) {
    const idx = e.detail.value
    const arr = [''].concat(this.data.occasions)
    this.setData({ 'filter.occasion': arr[idx] })
    this.loadClothes()
  },

  onColorChange(e) {
    const idx = e.detail.value
    const arr = [''].concat(this.data.colors)
    this.setData({ 'filter.color': arr[idx] })
    this.loadClothes()
  },

  onLongPress(e) {
    const item = e.currentTarget.dataset.item
    wx.showActionSheet({
      itemList: ['编辑', '记录穿着', item.is_favorite ? '取消收藏' : '标记心仪', '删除'],
      success: (res) => {
        switch (res.tapIndex) {
          case 0: this.editItem({ currentTarget: { dataset: { item } } }); break
          case 1: this.wearItem({ currentTarget: { dataset: { item } } }); break
          case 2: this.toggleFav({ currentTarget: { dataset: { item } } }); break
          case 3: this.removeItem({ currentTarget: { dataset: { item } } }); break
        }
      }
    })
  },

  onImgError(e) {
    const idx = e.currentTarget.dataset.idx
    this.setData({ [`clothes[${idx}].image`]: '/assets/icons/wardrobe.png' })
  },

  showAddModal() {
    this.setData({
      showForm: true,
      editingItem: null,
      form: { name: '', category: '上衣', season: '春秋', occasion: '日常', color: '', brand: '', image: '' },
      categoryIdx: 0, seasonIdx: 0, occasionIdx: 0
    })
  },

  editItem(e) {
    const item = e.currentTarget.dataset.item
    this.setData({
      showForm: true,
      editingItem: item,
      form: { name: item.name, category: item.category, season: item.season, occasion: item.occasion, color: item.color, brand: item.brand, image: item.image },
      categoryIdx: this.data.categories.indexOf(item.category),
      seasonIdx: this.data.seasons.indexOf(item.season),
      occasionIdx: this.data.occasions.indexOf(item.occasion)
    })
  },

  closeForm() {
    this.setData({ showForm: false, editingItem: null })
  },

  stopPropagation() {},

  onInput(e) {
    const field = e.currentTarget.dataset.field
    this.setData({ [`form.${field}`]: e.detail.value })
  },

  onFormCategory(e) {
    const idx = e.detail.value
    this.setData({ categoryIdx: idx, 'form.category': this.data.categories[idx] })
  },

  onFormSeason(e) {
    const idx = e.detail.value
    this.setData({ seasonIdx: idx, 'form.season': this.data.seasons[idx] })
  },

  onFormOccasion(e) {
    const idx = e.detail.value
    this.setData({ occasionIdx: idx, 'form.occasion': this.data.occasions[idx] })
  },

  takePhoto() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['camera'],
      success: (res) => {
        const tempPath = res.tempFiles[0].tempFilePath
        this.setData({ 'form.image': tempPath })
      }
    })
  },

  chooseImage() {
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album'],
      success: (res) => {
        const tempPath = res.tempFiles[0].tempFilePath
        this.setData({ 'form.image': tempPath })
      }
    })
  },

  previewImage() {
    if (this.data.form.image) {
      wx.previewImage({ urls: [this.data.form.image] })
    }
  },

  async submitForm() {
    if (!this.data.form.name) {
      wx.showToast({ title: '请输入衣物名称', icon: 'none' })
      return
    }
    try {
      if (this.data.editingItem) {
        const editId = this.data.editingItem.id || this.data.editingItem._id
        await api.updateClothes(editId, { ...this.data.form, is_favorite: this.data.editingItem.is_favorite })
      } else {
        await api.addClothes({ ...this.data.form, user_id: store.getUserId() })
      }
      this.closeForm()
      this.loadClothes()
      wx.showToast({ title: this.data.editingItem ? '修改成功' : '添加成功' })
    } catch (e) {
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  async toggleFav(e) {
    const item = e.currentTarget.dataset.item
    const itemId = item.id || item._id
    if (!itemId) {
      wx.showToast({ title: '衣物数据异常', icon: 'none' })
      return
    }
    try {
      await api.toggleFavorite(itemId)
      this.loadClothes()
      wx.showToast({ title: item.is_favorite ? '已取消心仪' : '已标记心仪' })
    } catch (err) {
      console.error('切换心仪失败', err)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  async wearItem(e) {
    const item = e.currentTarget.dataset.item
    const itemId = item.id || item._id
    if (!itemId) {
      wx.showToast({ title: '衣物数据异常', icon: 'none' })
      return
    }
    try {
      await api.recordWear(itemId)
      this.loadClothes()
      wx.showToast({ title: '已记录穿着' })
    } catch (err) {
      console.error('记录穿着失败', err)
      wx.showToast({ title: '操作失败', icon: 'none' })
    }
  },

  async removeItem(e) {
    const item = e.currentTarget.dataset.item
    const itemId = item.id || item._id
    if (!itemId) {
      wx.showToast({ title: '衣物数据异常', icon: 'none' })
      return
    }
    wx.showModal({
      title: '确认删除',
      content: '确定删除这件衣物吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            await api.deleteClothes(itemId)
            this.loadClothes()
            wx.showToast({ title: '已删除' })
          } catch (err) {
            console.error('删除失败', err)
            wx.showToast({ title: '删除失败', icon: 'none' })
          }
        }
      }
    })
  }
})
