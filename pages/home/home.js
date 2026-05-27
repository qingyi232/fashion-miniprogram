const api = require('../../utils/api')

Page({
  data: {
    showAnnouncement: false,
    announcement: {},
    weather: {},
    features: [
      { icon: '👚', title: '衣橱管理', desc: '拍照录入衣物，分类标签管理' },
      { icon: '✨', title: '智能搭配', desc: '根据场合天气，生成搭配方案' },
      { icon: '📸', title: '穿搭分享', desc: '分享穿搭灵感，发现时尚可能' },
      { icon: '📊', title: '数据分析', desc: '衣物使用统计，了解穿搭偏好' }
    ],
    shares: []
  },

  onLoad() {
    this.setWeather()
    this.loadShares()
    this.loadAnnouncements()
  },

  onPullDownRefresh() {
    this.loadShares()
    wx.stopPullDownRefresh()
  },

  setWeather() {
    const weatherData = [
      { icon: '☀️', temp: 24, desc: '晴天', tip: '气温舒适，适合穿轻薄外套搭配T恤，选择浅色系更显活力' },
      { icon: '⛅', temp: 20, desc: '多云', tip: '天气微凉，推荐针织开衫或薄卫衣，搭配牛仔裤休闲又时尚' },
      { icon: '🌧️', temp: 16, desc: '小雨', tip: '记得带伞，建议穿防水外套搭配深色系下装' },
      { icon: '🌤️', temp: 28, desc: '晴间多云', tip: '温度偏高，推荐透气面料的短袖或连衣裙，注意防晒' }
    ]
    const idx = new Date().getDay() % weatherData.length
    this.setData({ weather: weatherData[idx] })
  },

  async loadShares() {
    try {
      const res = await api.getShares()
      if (res.code === 200) {
        this.setData({ shares: res.data.slice(0, 6) })
      }
    } catch (e) {
      console.error('加载推荐穿搭失败', e)
    }
  },

  async loadAnnouncements() {
    try {
      const res = await api.getActiveAnnouncements()
      if (res.code === 200 && res.data && res.data.length > 0) {
        this.setData({ showAnnouncement: true, announcement: res.data[0] })
      }
    } catch (e) {
      console.error('加载公告失败', e)
    }
  },

  closeAnnouncement() {
    this.setData({ showAnnouncement: false })
  },

  goWardrobe() {
    wx.switchTab({ url: '/pages/wardrobe/wardrobe' })
  },

  goMatch() {
    wx.switchTab({ url: '/pages/match/match' })
  },

  goPublish() {
    wx.switchTab({ url: '/pages/share/share' })
  },

  goShare() {
    wx.switchTab({ url: '/pages/share/share' })
  },

  goShareDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/share-detail/share-detail?id=' + id })
  }
})
