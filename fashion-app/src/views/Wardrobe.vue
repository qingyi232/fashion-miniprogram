<template>
  <div class="container">
    <div class="page-header" style="display:flex;justify-content:space-between;align-items:center">
      <div>
        <h1>我的衣橱</h1>
        <p>共 {{ clothes.length }} 件衣物</p>
      </div>
      <button class="btn btn-primary" @click="showAdd = true">+ 添加衣物</button>
    </div>

    <div class="filter-bar">
      <select v-model="filter.category" @change="loadClothes">
        <option value="">全部类型</option>
        <option v-for="c in categories" :key="c">{{ c }}</option>
      </select>
      <select v-model="filter.season" @change="loadClothes">
        <option value="">全部季节</option>
        <option v-for="s in seasons" :key="s">{{ s }}</option>
      </select>
      <select v-model="filter.occasion" @change="loadClothes">
        <option value="">全部场合</option>
        <option v-for="o in occasions" :key="o">{{ o }}</option>
      </select>
      <input v-model="filter.keyword" @input="loadClothes" placeholder="搜索衣物..." class="search-input">
    </div>

    <div v-if="clothes.length" class="grid-4 clothes-grid">
      <div v-for="item in clothes" :key="item.id" class="clothes-card">
        <div class="clothes-img-wrap">
          <img :src="item.image" class="clothes-img" alt="">
          <button class="fav-btn" :class="{ active: item.is_favorite }" @click="toggleFav(item)">{{ item.is_favorite ? '❤️' : '🤍' }}</button>
        </div>
        <div class="clothes-info">
          <h4>{{ item.name }}</h4>
          <div class="clothes-tags">
            <span class="tag">{{ item.category }}</span>
            <span class="tag" v-if="item.color">{{ item.color }}</span>
          </div>
          <div class="clothes-meta">
            <span>穿过 {{ item.wear_count }} 次</span>
            <span v-if="item.brand">{{ item.brand }}</span>
          </div>
          <div class="clothes-actions">
            <button class="btn btn-sm btn-ghost" @click="editItem(item)">编辑</button>
            <button class="btn btn-sm btn-ghost" @click="wearItem(item)">穿了</button>
            <button class="btn btn-sm btn-ghost" style="color:var(--red)" @click="removeItem(item)">删除</button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="empty-state"><div class="icon">👚</div><p>衣橱还是空的，快添加衣物吧</p></div>

    <div v-if="showAdd || editingItem" class="modal-overlay" @click.self="closeForm">
      <div class="modal">
        <h2>{{ editingItem ? '编辑衣物' : '添加衣物' }}</h2>
        <div class="form-group"><label>衣物名称</label><input v-model="form.name" placeholder="如：白色基础T恤"></div>
        <div class="form-group"><label>图片链接</label><input v-model="form.image" placeholder="输入图片URL"></div>
        <div class="form-row">
          <div class="form-group"><label>类型</label><select v-model="form.category"><option v-for="c in categories" :key="c">{{ c }}</option></select></div>
          <div class="form-group"><label>季节</label><select v-model="form.season"><option v-for="s in seasons" :key="s">{{ s }}</option></select></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>场合</label><select v-model="form.occasion"><option v-for="o in occasions" :key="o">{{ o }}</option></select></div>
          <div class="form-group"><label>颜色</label><input v-model="form.color" placeholder="如：白色"></div>
        </div>
        <div class="form-group"><label>品牌</label><input v-model="form.brand" placeholder="如：UNIQLO"></div>
        <div class="modal-actions">
          <button class="btn btn-ghost" @click="closeForm">取消</button>
          <button class="btn btn-primary" @click="submitForm">{{ editingItem ? '保存修改' : '添加' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getClothes, addClothes, updateClothes, deleteClothes, toggleFavorite, recordWear } from '../api'
import { useUser } from '../stores/user'

const user = useUser()
const clothes = ref([])
const showAdd = ref(false)
const editingItem = ref(null)

const categories = ['上衣', '裤装', '裙装', '外套', '鞋子', '包包', '配饰']
const seasons = ['春秋', '夏季', '冬季', '四季']
const occasions = ['日常', '通勤', '约会', '正式', '运动', '休闲']

const filter = reactive({ category: '', season: '', occasion: '', keyword: '' })
const form = reactive({ name: '', category: '上衣', season: '春秋', occasion: '日常', color: '', brand: '', image: '' })

async function loadClothes() {
  const params = { user_id: user.state.user?.id || 1 }
  if (filter.category) params.category = filter.category
  if (filter.season) params.season = filter.season
  if (filter.occasion) params.occasion = filter.occasion
  if (filter.keyword) params.keyword = filter.keyword
  const res = await getClothes(params)
  if (res.code === 200) clothes.value = res.data
}

function editItem(item) {
  editingItem.value = item
  Object.assign(form, { name: item.name, category: item.category, season: item.season, occasion: item.occasion, color: item.color, brand: item.brand, image: item.image })
}

function closeForm() { showAdd.value = false; editingItem.value = null; Object.assign(form, { name: '', category: '上衣', season: '春秋', occasion: '日常', color: '', brand: '', image: '' }) }

async function submitForm() {
  if (!form.name) return
  if (editingItem.value) {
    await updateClothes(editingItem.value.id, { ...form, is_favorite: editingItem.value.is_favorite })
  } else {
    await addClothes({ ...form, user_id: user.state.user?.id || 1 })
  }
  closeForm()
  loadClothes()
}

async function toggleFav(item) {
  await toggleFavorite(item.id)
  item.is_favorite = item.is_favorite ? 0 : 1
}

async function wearItem(item) {
  await recordWear(item.id)
  item.wear_count++
}

async function removeItem(item) {
  if (confirm('确定删除这件衣物吗？')) {
    await deleteClothes(item.id)
    loadClothes()
  }
}

onMounted(loadClothes)
</script>

<style scoped>
.filter-bar { display: flex; gap: 10px; margin-bottom: 24px; flex-wrap: wrap; }
.filter-bar select, .search-input { padding: 8px 14px; border-radius: 8px; border: 1.5px solid var(--border); background: var(--card); font-size: 13px; color: var(--text); outline: none; }
.filter-bar select:focus, .search-input:focus { border-color: var(--accent); }
.search-input { flex: 1; min-width: 150px; }

.clothes-card { background: var(--card); border-radius: var(--radius); overflow: hidden; box-shadow: var(--shadow); border: 1px solid var(--border); transition: all 0.3s; }
.clothes-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
.clothes-img-wrap { position: relative; height: 200px; overflow: hidden; }
.clothes-img { width: 100%; height: 100%; object-fit: cover; }
.fav-btn { position: absolute; top: 8px; right: 8px; background: rgba(255,255,255,0.85); border: none; width: 32px; height: 32px; border-radius: 50%; font-size: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; }
.clothes-info { padding: 12px; }
.clothes-info h4 { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
.clothes-tags { display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 8px; }
.clothes-meta { font-size: 12px; color: var(--text3); display: flex; justify-content: space-between; margin-bottom: 10px; }
.clothes-actions { display: flex; gap: 6px; }
</style>
