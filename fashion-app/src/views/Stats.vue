<template>
  <div class="container">
    <div class="page-header"><h1>数据分析</h1><p>了解你的衣橱使用情况与穿搭偏好</p></div>

    <div class="stats-overview">
      <div class="stat-card card">
        <span class="stat-icon">👚</span>
        <div class="stat-num">{{ clothesData.total || 0 }}</div>
        <div class="stat-label">衣物总数</div>
      </div>
      <div class="stat-card card">
        <span class="stat-icon">❤️</span>
        <div class="stat-num">{{ clothesData.favoriteCount || 0 }}</div>
        <div class="stat-label">心仪衣物</div>
      </div>
      <div class="stat-card card">
        <span class="stat-icon">✨</span>
        <div class="stat-num">{{ styleData.outfits?.length || 0 }}</div>
        <div class="stat-label">穿搭风格</div>
      </div>
      <div class="stat-card card">
        <span class="stat-icon">📸</span>
        <div class="stat-num">{{ styleData.occasions?.length || 0 }}</div>
        <div class="stat-label">涵盖场合</div>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom:24px">
      <div class="chart-card card">
        <h3>衣物分类分布</h3>
        <div class="bar-chart">
          <div v-for="item in clothesData.byCategory" :key="item.category" class="bar-row">
            <span class="bar-label">{{ item.category }}</span>
            <div class="bar-track"><div class="bar-fill" :style="{ width: barPercent(item.count, clothesData.byCategory) }"></div></div>
            <span class="bar-val">{{ item.count }}</span>
          </div>
        </div>
      </div>
      <div class="chart-card card">
        <h3>季节分布</h3>
        <div class="bar-chart">
          <div v-for="item in clothesData.bySeason" :key="item.season" class="bar-row">
            <span class="bar-label">{{ item.season }}</span>
            <div class="bar-track"><div class="bar-fill season" :style="{ width: barPercent(item.count, clothesData.bySeason) }"></div></div>
            <span class="bar-val">{{ item.count }}</span>
          </div>
        </div>
      </div>
    </div>

    <div class="grid-2" style="margin-bottom:24px">
      <div class="chart-card card">
        <h3>颜色偏好</h3>
        <div class="color-grid">
          <div v-for="item in clothesData.byColor" :key="item.color" class="color-item">
            <span class="color-name">{{ item.color }}</span>
            <span class="color-count">{{ item.count }}件</span>
          </div>
        </div>
      </div>
      <div class="chart-card card">
        <h3>穿搭风格分析</h3>
        <div class="style-list" v-if="styleData.outfits?.length">
          <div v-for="item in styleData.outfits" :key="item.style" class="style-item">
            <span class="style-name">{{ item.style }}</span>
            <div class="style-bar"><div class="style-fill" :style="{ width: barPercent(item.count, styleData.outfits) }"></div></div>
            <span class="style-count">{{ item.count }}次</span>
          </div>
        </div>
        <div v-else class="empty-mini">暂无数据</div>
      </div>
    </div>

    <div class="grid-2">
      <div class="chart-card card">
        <h3>最常穿的衣物 TOP5</h3>
        <div class="top-list">
          <div v-for="(item, i) in clothesData.mostWorn" :key="item.id" class="top-item">
            <span class="top-rank">{{ i + 1 }}</span>
            <img :src="item.image" class="top-img">
            <div class="top-info">
              <span class="top-name">{{ item.name }}</span>
              <span class="top-count">穿过 {{ item.wear_count }} 次</span>
            </div>
          </div>
        </div>
      </div>
      <div class="chart-card card">
        <h3>闲置衣物提醒</h3>
        <div class="top-list" v-if="clothesData.leastWorn?.length">
          <div v-for="item in clothesData.leastWorn" :key="item.id" class="top-item">
            <span class="idle-badge">💤</span>
            <img :src="item.image" class="top-img">
            <div class="top-info">
              <span class="top-name">{{ item.name }}</span>
              <span class="top-count idle">仅穿过 {{ item.wear_count }} 次</span>
            </div>
          </div>
        </div>
        <div v-else class="empty-mini">没有闲置衣物，棒！</div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getClothesStats, getStyleStats } from '../api'
import { useUser } from '../stores/user'

const user = useUser()
const clothesData = ref({})
const styleData = ref({})

function barPercent(count, arr) {
  const max = Math.max(...arr.map(a => a.count || 0), 1)
  return Math.round((count / max) * 100) + '%'
}

onMounted(async () => {
  const uid = user.state.user?.id || 1
  const [r1, r2] = await Promise.all([getClothesStats(uid), getStyleStats(uid)])
  if (r1.code === 200) clothesData.value = r1.data
  if (r2.code === 200) styleData.value = r2.data
})
</script>

<style scoped>
.stats-overview { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
.stat-card { padding: 24px; text-align: center; }
.stat-icon { font-size: 28px; display: block; margin-bottom: 8px; }
.stat-num { font-size: 32px; font-weight: 700; color: var(--accent-dark); }
.stat-label { font-size: 13px; color: var(--text2); margin-top: 4px; }

.chart-card { padding: 24px; }
.chart-card h3 { font-size: 15px; font-weight: 600; margin-bottom: 16px; }

.bar-chart { display: flex; flex-direction: column; gap: 10px; }
.bar-row { display: flex; align-items: center; gap: 10px; }
.bar-label { width: 50px; font-size: 13px; color: var(--text2); text-align: right; flex-shrink: 0; }
.bar-track { flex: 1; height: 20px; background: var(--bg); border-radius: 10px; overflow: hidden; }
.bar-fill { height: 100%; background: linear-gradient(90deg, var(--accent-light), var(--accent)); border-radius: 10px; transition: width 0.8s ease-out; min-width: 4px; }
.bar-fill.season { background: linear-gradient(90deg, var(--pink-light), var(--pink)); }
.bar-val { font-size: 13px; font-weight: 600; color: var(--text); width: 28px; }

.color-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
.color-item { display: flex; justify-content: space-between; padding: 10px 14px; border-radius: 8px; background: var(--bg); }
.color-name { font-size: 13px; color: var(--text); }
.color-count { font-size: 13px; color: var(--accent-dark); font-weight: 600; }

.style-list { display: flex; flex-direction: column; gap: 10px; }
.style-item { display: flex; align-items: center; gap: 10px; }
.style-name { width: 50px; font-size: 13px; color: var(--text2); }
.style-bar { flex: 1; height: 16px; background: var(--bg); border-radius: 8px; overflow: hidden; }
.style-fill { height: 100%; background: linear-gradient(90deg, var(--green-light), var(--green)); border-radius: 8px; min-width: 4px; }
.style-count { font-size: 12px; color: var(--text3); width: 36px; }

.top-list { display: flex; flex-direction: column; gap: 12px; }
.top-item { display: flex; align-items: center; gap: 12px; }
.top-rank { width: 24px; height: 24px; border-radius: 6px; background: var(--accent-light); color: var(--accent-dark); font-size: 12px; font-weight: 700; display: flex; align-items: center; justify-content: center; }
.idle-badge { font-size: 18px; }
.top-img { width: 44px; height: 44px; border-radius: 8px; object-fit: cover; }
.top-info { flex: 1; }
.top-name { display: block; font-size: 13px; font-weight: 500; }
.top-count { font-size: 12px; color: var(--text3); }
.top-count.idle { color: var(--red); }

.empty-mini { text-align: center; padding: 24px; color: var(--text3); font-size: 13px; }

@media (max-width: 768px) { .stats-overview { grid-template-columns: repeat(2, 1fr); } }
</style>
