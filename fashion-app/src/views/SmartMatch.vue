<template>
  <div class="container">
    <div class="page-header"><h1>智能搭配</h1><p>选择场合与天气，为你生成个性化搭配方案</p></div>

    <div class="mode-tabs">
      <button :class="['mode-tab', { active: mode === 'auto' }]" @click="mode = 'auto'">✨ 自动搭配</button>
      <button :class="['mode-tab', { active: mode === 'manual' }]" @click="mode = 'manual'; loadAllClothes()">🖐️ 手动搭配</button>
    </div>

    <!-- 自动搭配 -->
    <template v-if="mode === 'auto'">
      <div class="match-panel card">
        <h3>搭配条件</h3>
        <div class="form-row" style="margin-top:16px">
          <div class="form-group"><label>穿搭场合</label>
            <select v-model="params.occasion"><option v-for="o in occasions" :key="o">{{ o }}</option></select>
          </div>
          <div class="form-group"><label>天气情况</label>
            <select v-model="params.weather"><option v-for="w in weathers" :key="w">{{ w }}</option></select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>季节</label>
            <select v-model="params.season"><option v-for="s in seasons" :key="s">{{ s }}</option></select>
          </div>
          <div class="form-group"></div>
        </div>
        <button class="btn btn-primary" style="width:100%;margin-top:8px" @click="generate" :disabled="loading">
          {{ loading ? '搭配方案生成中...' : '✨ 生成搭配方案' }}
        </button>
      </div>

      <div v-if="schemes.length" class="schemes">
        <h3 class="section-sub">为你推荐 {{ schemes.length }} 套搭配方案</h3>
        <div class="scheme-list">
          <div v-for="(s, idx) in schemes" :key="idx" class="scheme-card card">
            <div class="scheme-header">
              <h4>{{ s.title }}</h4>
              <div class="scheme-tags">
                <span class="tag">{{ s.occasion }}</span>
                <span class="tag">{{ s.weather }}</span>
                <span class="tag">{{ s.style }}</span>
              </div>
            </div>
            <div class="scheme-items">
              <div v-for="item in s.itemDetails" :key="item.id" class="scheme-item">
                <img :src="item.image" alt="">
                <span>{{ item.name }}</span>
              </div>
            </div>
            <div class="scheme-actions">
              <button class="btn btn-sm btn-primary" @click="saveScheme(s)">💾 保存方案</button>
              <button class="btn btn-sm btn-outline" @click="publishScheme(s)">📤 分享到广场</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 手动搭配 -->
    <template v-if="mode === 'manual'">
      <div class="manual-layout">
        <div class="manual-left">
          <h3>我的衣物</h3>
          <div class="manual-filter">
            <select v-model="manualFilter" @change="loadAllClothes">
              <option value="">全部类型</option>
              <option v-for="c in categories" :key="c">{{ c }}</option>
            </select>
          </div>
          <div class="manual-clothes-grid">
            <div v-for="item in allClothes" :key="item.id" class="manual-cloth" :class="{ selected: manualSelected.includes(item.id) }" @click="toggleManualSelect(item)">
              <img :src="item.image" alt="">
              <span>{{ item.name }}</span>
              <span v-if="manualSelected.includes(item.id)" class="check-mark">✓</span>
            </div>
          </div>
        </div>
        <div class="manual-right">
          <h3>搭配预览（已选 {{ manualSelected.length }} 件）</h3>
          <div class="preview-area" v-if="selectedDetails.length">
            <div class="preview-items">
              <div v-for="item in selectedDetails" :key="item.id" class="preview-item">
                <img :src="item.image" alt="">
                <div class="preview-info">
                  <span class="preview-name">{{ item.name }}</span>
                  <span class="preview-cat">{{ item.category }} · {{ item.color }}</span>
                </div>
                <button class="remove-btn" @click="removeManual(item.id)">✕</button>
              </div>
            </div>
            <div class="manual-form">
              <div class="form-group"><label>方案名称</label><input v-model="manualTitle" placeholder="如：春日出游搭配"></div>
              <div class="form-row">
                <div class="form-group"><label>场合</label><select v-model="manualOccasion"><option v-for="o in occasions" :key="o">{{ o }}</option></select></div>
                <div class="form-group"><label>公开/私有</label><select v-model="manualPublic"><option :value="1">公开</option><option :value="0">仅自己可见</option></select></div>
              </div>
              <button class="btn btn-primary" style="width:100%" @click="saveManual">💾 保存手动搭配</button>
            </div>
          </div>
          <div v-else class="empty-state"><div class="icon">👆</div><p>从左侧选择衣物组合搭配</p></div>
        </div>
      </div>
    </template>

    <div v-if="savedOutfits.length" class="saved-section">
      <h3 class="section-sub">已保存的搭配（{{ savedOutfits.length }}）</h3>
      <div class="grid-3">
        <div v-for="o in savedOutfits" :key="o.id" class="saved-card card">
          <h4>{{ o.title }}</h4>
          <div class="saved-tags">
            <span class="tag">{{ o.occasion }}</span>
            <span class="tag">{{ o.style || o.season }}</span>
            <span v-if="o.is_auto" class="tag" style="background:var(--green-light);color:var(--green)">AI推荐</span>
            <span v-else class="tag" style="background:var(--pink-light);color:var(--pink)">手动搭配</span>
            <span v-if="o.is_public" class="tag" style="background:#eef0ff;color:#6c7ae0">公开</span>
            <span v-else class="tag">私有</span>
          </div>
          <p class="saved-meta">{{ o.created_at?.split('T')[0] || o.created_at?.substring(0,10) }}</p>
          <div style="display:flex;gap:6px;margin-top:8px">
            <button class="btn btn-sm btn-outline" @click="publishScheme(o)">分享</button>
            <button class="btn btn-sm btn-ghost" style="color:var(--red)" @click="removeOutfit(o)">删除</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { generateOutfits, saveOutfit, getOutfits, deleteOutfit, getClothes } from '../api'
import { useUser } from '../stores/user'

const router = useRouter()
const user = useUser()
const loading = ref(false)
const schemes = ref([])
const savedOutfits = ref([])
const mode = ref('auto')

const allClothes = ref([])
const manualSelected = ref([])
const manualFilter = ref('')
const manualTitle = ref('')
const manualOccasion = ref('日常')
const manualPublic = ref(0)

const occasions = ['日常', '通勤', '约会', '正式', '运动', '休闲']
const weathers = ['晴天', '阴天', '雨天', '大风']
const seasons = ['春季', '夏季', '秋季', '冬季']
const categories = ['上衣', '裤装', '裙装', '外套', '鞋子', '包包', '配饰']

const params = reactive({ occasion: '日常', weather: '晴天', season: '春季' })

const selectedDetails = computed(() => allClothes.value.filter(c => manualSelected.value.includes(c.id)))

async function loadAllClothes() {
  const p = { user_id: user.state.user?.id || 1 }
  if (manualFilter.value) p.category = manualFilter.value
  const res = await getClothes(p)
  if (res.code === 200) allClothes.value = res.data
}

function toggleManualSelect(item) {
  const idx = manualSelected.value.indexOf(item.id)
  if (idx >= 0) manualSelected.value.splice(idx, 1)
  else manualSelected.value.push(item.id)
}
function removeManual(id) { manualSelected.value = manualSelected.value.filter(i => i !== id) }

async function saveManual() {
  if (!manualSelected.value.length || !manualTitle.value) return alert('请选择衣物并填写方案名称')
  await saveOutfit({
    user_id: user.state.user?.id || 1,
    title: manualTitle.value, occasion: manualOccasion.value,
    weather: '', season: '', style: '手动',
    items: manualSelected.value, is_auto: 0, is_public: manualPublic.value
  })
  manualSelected.value = []
  manualTitle.value = ''
  loadSaved()
  alert('保存成功！')
}

async function generate() {
  loading.value = true
  schemes.value = []
  const res = await generateOutfits({ user_id: user.state.user?.id || 1, ...params })
  if (res.code === 200) schemes.value = res.data
  loading.value = false
}

async function saveScheme(s) {
  await saveOutfit({
    user_id: user.state.user?.id || 1,
    title: s.title, occasion: s.occasion, weather: s.weather,
    season: s.season, style: s.style, items: s.items, is_auto: 1, is_public: 0
  })
  loadSaved()
  alert('保存成功！')
}

function publishScheme(s) {
  router.push('/share')
}

async function loadSaved() {
  const res = await getOutfits({ user_id: user.state.user?.id || 1 })
  if (res.code === 200) savedOutfits.value = res.data
}

async function removeOutfit(o) {
  if (confirm('确定删除？')) { await deleteOutfit(o.id); loadSaved() }
}

onMounted(loadSaved)
</script>

<style scoped>
.mode-tabs { display: flex; gap: 10px; margin-bottom: 24px; }
.mode-tab { padding: 10px 28px; border-radius: 10px; font-size: 14px; font-weight: 600; border: 2px solid var(--border); background: var(--card); color: var(--text2); transition: all 0.2s; }
.mode-tab.active { background: var(--accent); color: #fff; border-color: var(--accent); }

.match-panel { padding: 24px; margin-bottom: 32px; }
.match-panel h3 { font-size: 16px; font-weight: 600; }
.section-sub { font-size: 18px; font-weight: 600; margin-bottom: 20px; margin-top: 8px; }

.schemes { margin-bottom: 40px; }
.scheme-list { display: flex; flex-direction: column; gap: 20px; }
.scheme-card { padding: 24px; }
.scheme-header { margin-bottom: 16px; }
.scheme-header h4 { font-size: 16px; font-weight: 600; margin-bottom: 8px; }
.scheme-tags { display: flex; gap: 6px; }
.scheme-items { display: flex; gap: 14px; overflow-x: auto; padding-bottom: 8px; margin-bottom: 16px; }
.scheme-item { flex: 0 0 110px; text-align: center; }
.scheme-item img { width: 110px; height: 130px; object-fit: cover; border-radius: 10px; box-shadow: var(--shadow); margin-bottom: 6px; }
.scheme-item span { font-size: 12px; color: var(--text2); }
.scheme-actions { display: flex; gap: 10px; }

.manual-layout { display: flex; gap: 24px; margin-bottom: 32px; }
.manual-left { flex: 1; }
.manual-left h3, .manual-right h3 { font-size: 16px; font-weight: 600; margin-bottom: 12px; }
.manual-filter { margin-bottom: 12px; }
.manual-filter select { padding: 8px 14px; border-radius: 8px; border: 1.5px solid var(--border); background: var(--card); font-size: 13px; }
.manual-clothes-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; max-height: 500px; overflow-y: auto; }
.manual-cloth { position: relative; cursor: pointer; border-radius: 10px; overflow: hidden; border: 2px solid var(--border); transition: all 0.2s; }
.manual-cloth.selected { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent-light); }
.manual-cloth img { width: 100%; height: 100px; object-fit: cover; }
.manual-cloth span { display: block; font-size: 11px; padding: 4px 6px; text-align: center; color: var(--text2); }
.check-mark { position: absolute; top: 4px; right: 4px; width: 22px; height: 22px; border-radius: 50%; background: var(--accent); color: #fff; font-size: 12px; display: flex; align-items: center; justify-content: center; }

.manual-right { flex: 1; }
.preview-area { background: var(--card); border-radius: var(--radius); padding: 20px; border: 1px solid var(--border); box-shadow: var(--shadow); }
.preview-items { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; }
.preview-item { display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 10px; background: var(--bg); }
.preview-item img { width: 56px; height: 56px; border-radius: 8px; object-fit: cover; }
.preview-info { flex: 1; }
.preview-name { display: block; font-size: 13px; font-weight: 600; }
.preview-cat { font-size: 12px; color: var(--text3); }
.remove-btn { width: 24px; height: 24px; border: none; background: rgba(212,114,106,0.1); color: var(--red); border-radius: 50%; font-size: 12px; cursor: pointer; }

.saved-section { margin-bottom: 40px; }
.saved-card { padding: 20px; }
.saved-card h4 { font-size: 15px; font-weight: 600; margin-bottom: 8px; }
.saved-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px; }
.saved-meta { font-size: 12px; color: var(--text3); }

@media (max-width: 768px) { .manual-layout { flex-direction: column; } }
</style>
