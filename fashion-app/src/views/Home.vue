<template>
  <div>
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <span class="hero-badge">智能穿搭助手</span>
          <h1>用心搭配每一天</h1>
          <p>管理衣橱、智能搭配、分享穿搭灵感，让每天的穿搭都充满仪式感</p>
          <div class="hero-actions">
            <router-link to="/match" class="btn btn-primary">开始搭配 ✨</router-link>
            <router-link to="/share" class="btn btn-outline">浏览广场</router-link>
          </div>
        </div>
        <div class="hero-visual">
          <img src="https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=500&h=600&fit=crop" class="hero-img" alt="fashion">
        </div>
      </div>
    </section>

    <section class="weather-section">
      <div class="container">
        <div class="weather-card card">
          <div class="weather-left">
            <span class="weather-icon">{{ weather.icon }}</span>
            <div class="weather-info">
              <div class="weather-temp">{{ weather.temp }}°C</div>
              <div class="weather-desc">{{ weather.desc }}</div>
            </div>
          </div>
          <div class="weather-right">
            <div class="weather-tip-label">今日穿搭建议</div>
            <div class="weather-tip">{{ weather.tip }}</div>
          </div>
          <router-link to="/match" class="weather-action btn btn-sm btn-outline">去搭配</router-link>
        </div>
      </div>
    </section>

    <section class="quick-entry">
      <div class="container">
        <div class="entry-grid">
          <router-link to="/wardrobe" class="entry-item">
            <div class="entry-icon-wrap" style="background:#fef0ec"><span>👚</span></div>
            <span class="entry-text">添加衣物</span>
          </router-link>
          <router-link to="/match" class="entry-item">
            <div class="entry-icon-wrap" style="background:#edf7f0"><span>✨</span></div>
            <span class="entry-text">智能搭配</span>
          </router-link>
          <router-link to="/share" class="entry-item" @click.prevent="goPublish">
            <div class="entry-icon-wrap" style="background:#fdf2f4"><span>📸</span></div>
            <span class="entry-text">发布穿搭</span>
          </router-link>
          <router-link to="/share" class="entry-item">
            <div class="entry-icon-wrap" style="background:#faf5ef"><span>🔥</span></div>
            <span class="entry-text">穿搭广场</span>
          </router-link>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="container">
        <h2 class="section-title">核心功能</h2>
        <div class="grid-4">
          <div class="feature-card" v-for="f in features" :key="f.title">
            <span class="feature-icon">{{ f.icon }}</span>
            <h3>{{ f.title }}</h3>
            <p>{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <section class="trending" v-if="shares.length">
      <div class="container">
        <h2 class="section-title">推荐穿搭</h2>
        <div class="grid-3">
          <router-link v-for="s in shares" :key="s.id" :to="`/share/${s.id}`" class="trend-card">
            <div class="trend-img-wrap">
              <img :src="s.images" class="trend-img" alt="">
            </div>
            <div class="trend-info">
              <div class="trend-user">
                <img :src="s.avatar" class="trend-avatar">
                <span>{{ s.nickname }}</span>
              </div>
              <p class="trend-text">{{ s.content }}</p>
              <div class="trend-tags-row">
                <span v-for="t in (s.style_tags || '').split(',')" :key="t" class="mini-tag">{{ t }}</span>
              </div>
              <div class="trend-stats">
                <span>❤️ {{ s.likes_count }}</span>
                <span>💬 {{ s.comments_count }}</span>
                <span>⭐ {{ s.collects_count }}</span>
              </div>
            </div>
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getShares } from '../api'

const router = useRouter()
const shares = ref([])

const weatherData = [
  { icon: '☀️', temp: 24, desc: '晴天', tip: '气温舒适，适合穿轻薄外套搭配T恤，选择浅色系更显活力' },
  { icon: '⛅', temp: 20, desc: '多云', tip: '天气微凉，推荐针织开衫或薄卫衣，搭配牛仔裤休闲又时尚' },
  { icon: '🌧️', temp: 16, desc: '小雨', tip: '记得带伞，建议穿防水外套搭配深色系下装，避免浅色' },
  { icon: '🌤️', temp: 28, desc: '晴间多云', tip: '温度偏高，推荐透气面料的短袖或连衣裙，注意防晒' },
]

const weather = ref(weatherData[new Date().getDay() % weatherData.length])

const features = [
  { icon: '👚', title: '衣橱管理', desc: '拍照录入衣物，分类标签管理，一目了然' },
  { icon: '✨', title: '智能搭配', desc: '根据场合天气，AI生成个性化搭配方案' },
  { icon: '📸', title: '穿搭分享', desc: '分享你的穿搭灵感，发现更多时尚可能' },
  { icon: '📊', title: '数据分析', desc: '衣物使用统计，了解你的穿搭偏好' },
]

function goPublish() {
  router.push('/share')
}

onMounted(async () => {
  const res = await getShares()
  if (res.code === 200) shares.value = res.data.slice(0, 6)
})
</script>

<style scoped>
.hero { padding: 56px 0 40px; background: linear-gradient(165deg, #f7f8f9 0%, #fef0ec 40%, #fdf2f4 70%, #edf7f0 100%); position: relative; overflow: hidden; }
.hero::before { content: ''; position: absolute; top: -40%; right: -10%; width: 500px; height: 500px; border-radius: 50%; background: rgba(224,122,95,0.06); pointer-events: none; }
.hero .container { display: flex; align-items: center; gap: 64px; }
.hero-content { flex: 1; }
.hero-badge { display: inline-block; padding: 6px 18px; border-radius: 20px; font-size: 12px; font-weight: 600; background: var(--accent-light); color: var(--accent-dark); margin-bottom: 24px; letter-spacing: 1px; }
.hero-content h1 { font-size: 44px; font-weight: 800; line-height: 1.2; color: var(--text); margin-bottom: 18px; letter-spacing: -0.5px; }
.hero-content p { font-size: 16px; color: var(--text2); line-height: 1.8; margin-bottom: 36px; }
.hero-actions { display: flex; gap: 14px; }
.hero-visual { flex: 0 0 400px; }
.hero-img { width: 100%; border-radius: 28px; box-shadow: 0 20px 60px rgba(224,122,95,0.15); object-fit: cover; }

.weather-section { padding: 0 0 8px; margin-top: -20px; position: relative; z-index: 2; }
.weather-card { display: flex; align-items: center; gap: 24px; padding: 20px 28px; border-radius: 16px; }
.weather-left { display: flex; align-items: center; gap: 14px; flex-shrink: 0; }
.weather-icon { font-size: 40px; }
.weather-temp { font-size: 28px; font-weight: 700; color: var(--text); }
.weather-desc { font-size: 13px; color: var(--text2); }
.weather-right { flex: 1; }
.weather-tip-label { font-size: 11px; color: var(--accent-dark); font-weight: 600; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; }
.weather-tip { font-size: 13px; color: var(--text2); line-height: 1.6; }
.weather-action { flex-shrink: 0; }

.quick-entry { padding: 24px 0; }
.entry-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
.entry-item { display: flex; flex-direction: column; align-items: center; gap: 10px; padding: 20px; background: var(--card); border-radius: var(--radius); box-shadow: var(--shadow); border: 1px solid var(--border); transition: all 0.3s; cursor: pointer; }
.entry-item:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); border-color: rgba(224,122,95,0.15); }
.entry-icon-wrap { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
.entry-text { font-size: 13px; font-weight: 600; color: var(--text); }

.section-title { text-align: center; font-size: 24px; font-weight: 700; margin-bottom: 12px; color: var(--text); }
.section-title::after { content: ''; display: block; width: 40px; height: 3px; background: var(--accent); border-radius: 2px; margin: 12px auto 36px; }

.features { padding: 48px 0; }
.feature-card { background: var(--card); border-radius: var(--radius); padding: 32px 22px; text-align: center; box-shadow: var(--shadow); border: 1px solid var(--border); transition: all 0.35s; }
.feature-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); border-color: rgba(224,122,95,0.2); }
.feature-icon { font-size: 38px; display: block; margin-bottom: 16px; }
.feature-card h3 { font-size: 16px; font-weight: 600; margin-bottom: 10px; color: var(--text); }
.feature-card p { font-size: 13px; color: var(--text2); line-height: 1.7; }

.trending { padding: 48px 0 72px; }
.trend-card { background: var(--card); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); border: 1px solid var(--border); transition: all 0.35s; display: block; }
.trend-card:hover { transform: translateY(-5px); box-shadow: var(--shadow-lg); }
.trend-img-wrap { width: 100%; height: 260px; overflow: hidden; }
.trend-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.5s; }
.trend-card:hover .trend-img { transform: scale(1.06); }
.trend-info { padding: 18px; }
.trend-user { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.trend-avatar { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-light); }
.trend-user span { font-size: 13px; font-weight: 600; }
.trend-text { font-size: 13px; color: var(--text2); line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 8px; }
.trend-tags-row { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 10px; }
.mini-tag { font-size: 11px; padding: 2px 8px; border-radius: 10px; background: var(--accent-light); color: var(--accent-dark); }
.trend-stats { display: flex; gap: 16px; font-size: 12px; color: var(--text3); }

@media (max-width: 768px) {
  .hero .container { flex-direction: column; gap: 32px; }
  .hero-visual { flex: none; width: 100%; }
  .hero-content h1 { font-size: 28px; }
  .hero { padding: 36px 0 48px; }
  .entry-grid { grid-template-columns: repeat(2, 1fr); }
  .weather-card { flex-wrap: wrap; }
}
</style>
