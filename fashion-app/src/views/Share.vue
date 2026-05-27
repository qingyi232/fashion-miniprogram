<template>
  <div class="container">
    <div class="page-header" style="display:flex;justify-content:space-between;align-items:center">
      <div><h1>穿搭广场</h1><p>发现更多穿搭灵感</p></div>
      <button class="btn btn-primary" @click="showPublish = true">📸 发布穿搭</button>
    </div>

    <div class="filter-section">
      <div class="filter-row">
        <span class="filter-label">风格：</span>
        <div class="filter-tags">
          <button :class="['filter-tag', { active: !styleFilter }]" @click="styleFilter = ''; loadShares()">全部</button>
          <button v-for="t in styleTags" :key="t" :class="['filter-tag', { active: styleFilter === t }]" @click="styleFilter = t; loadShares()">{{ t }}</button>
        </div>
      </div>
      <div class="filter-row">
        <span class="filter-label">场合：</span>
        <div class="filter-tags">
          <button :class="['filter-tag', { active: !occasionFilter }]" @click="occasionFilter = ''; loadShares()">全部</button>
          <button v-for="o in occasionTags" :key="o" :class="['filter-tag', { active: occasionFilter === o }]" @click="occasionFilter = o; loadShares()">{{ o }}</button>
        </div>
      </div>
    </div>

    <div class="share-grid" v-if="shares.length">
      <router-link v-for="s in shares" :key="s.id" :to="`/share/${s.id}`" class="share-card">
        <div class="share-img-wrap">
          <img :src="s.images" class="share-img" alt="">
        </div>
        <div class="share-body">
          <div class="share-user">
            <img :src="s.avatar" class="share-avatar">
            <span>{{ s.nickname }}</span>
          </div>
          <p class="share-text">{{ s.content }}</p>
          <div class="share-tags-row">
            <span v-for="tag in (s.style_tags || '').split(',')" :key="tag" class="mini-tag">{{ tag }}</span>
          </div>
          <div class="share-bottom">
            <div class="share-stats">
              <span>❤️ {{ s.likes_count }}</span>
              <span>💬 {{ s.comments_count }}</span>
              <span>⭐ {{ s.collects_count }}</span>
            </div>
            <button class="borrow-btn" @click.prevent="borrowOutfit(s)" title="借鉴到我的穿搭库">📥</button>
          </div>
        </div>
      </router-link>
    </div>
    <div v-else class="empty-state"><div class="icon">📸</div><p>暂无穿搭分享</p></div>

    <div v-if="showPublish" class="modal-overlay" @click.self="showPublish = false">
      <div class="modal">
        <h2>发布穿搭</h2>
        <div class="form-group"><label>穿搭图片URL</label><input v-model="pubForm.images" placeholder="输入图片链接"></div>
        <div class="form-group"><label>穿搭描述</label><textarea v-model="pubForm.content" rows="3" placeholder="分享你的穿搭心得..."></textarea></div>
        <div class="form-row">
          <div class="form-group"><label>风格标签</label><input v-model="pubForm.style_tags" placeholder="如：简约,通勤"></div>
          <div class="form-group"><label>场合标签</label><input v-model="pubForm.occasion_tags" placeholder="如：日常,约会"></div>
        </div>
        <div class="form-group"><label>可见范围</label>
          <select v-model="pubForm.visibility"><option value="public">公开</option><option value="private">仅自己可见</option></select>
        </div>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="showPublish = false">取消</button>
          <button class="btn btn-primary" @click="doPublish">发布</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getShares, createShare, saveOutfit } from '../api'
import { useUser } from '../stores/user'

const user = useUser()
const shares = ref([])
const showPublish = ref(false)
const styleFilter = ref('')
const occasionFilter = ref('')

const styleTags = ['简约', '甜美', '日系', '法式', '极简', '知性', '运动', '街头']
const occasionTags = ['日常', '通勤', '约会', '正式', '休闲', '运动']

const pubForm = reactive({ images: '', content: '', style_tags: '', occasion_tags: '', visibility: 'public' })

async function loadShares() {
  const params = {}
  if (styleFilter.value) params.style = styleFilter.value
  if (occasionFilter.value) params.occasion = occasionFilter.value
  const res = await getShares(params)
  if (res.code === 200) shares.value = res.data
}

async function borrowOutfit(s) {
  const tags = (s.style_tags || '').split(',').filter(Boolean)
  await saveOutfit({
    user_id: user.state.user?.id || 1,
    title: `借鉴：${s.nickname}的穿搭`,
    occasion: (s.occasion_tags || '').split(',')[0] || '日常',
    weather: '', season: '', style: tags[0] || '借鉴',
    items: [], is_auto: 0, is_public: 0
  })
  alert('已借鉴到你的穿搭库！')
}

async function doPublish() {
  if (!pubForm.content) return
  const res = await createShare({ ...pubForm, user_id: user.state.user?.id || 1 })
  showPublish.value = false
  Object.assign(pubForm, { images: '', content: '', style_tags: '', occasion_tags: '', visibility: 'public' })
  loadShares()
  alert(res?.message || '已提交审核')
}

onMounted(loadShares)
</script>

<style scoped>
.filter-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 24px; }
.filter-tag { padding: 6px 16px; border-radius: 20px; font-size: 13px; border: 1.5px solid var(--border); background: var(--card); color: var(--text2); transition: all 0.2s; }
.filter-tag.active, .filter-tag:hover { background: var(--accent); color: #fff; border-color: var(--accent); }

.share-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; }
.share-card { background: var(--card); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); border: 1px solid var(--border); transition: all 0.3s; display: block; }
.share-card:hover { transform: translateY(-3px); box-shadow: var(--shadow-lg); }
.share-img-wrap { height: 280px; overflow: hidden; }
.share-img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s; }
.share-card:hover .share-img { transform: scale(1.04); }
.share-body { padding: 16px; }
.share-user { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.share-avatar { width: 30px; height: 30px; border-radius: 50%; object-fit: cover; }
.share-user span { font-size: 13px; font-weight: 500; }
.share-text { font-size: 13px; color: var(--text2); line-height: 1.6; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 10px; }
.share-tags-row { display: flex; gap: 6px; margin-bottom: 10px; flex-wrap: wrap; }
.mini-tag { font-size: 11px; padding: 2px 8px; border-radius: 10px; background: var(--accent-light); color: var(--accent-dark); }
.share-bottom { display: flex; justify-content: space-between; align-items: center; }
.share-stats { display: flex; gap: 14px; font-size: 12px; color: var(--text3); }
.borrow-btn { width: 30px; height: 30px; border: 1.5px solid var(--border); background: var(--bg); border-radius: 8px; font-size: 14px; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.2s; }
.borrow-btn:hover { border-color: var(--accent); background: var(--accent-light); }

.filter-section { margin-bottom: 24px; }
.filter-row { display: flex; align-items: center; gap: 10px; margin-bottom: 10px; }
.filter-label { font-size: 13px; color: var(--text2); font-weight: 500; flex-shrink: 0; }

@media (max-width: 600px) { .share-grid { grid-template-columns: 1fr; } .filter-row { flex-wrap: wrap; } }
</style>
