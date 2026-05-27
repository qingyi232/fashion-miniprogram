<template>
  <div class="container">
    <div v-if="!userStore.state.isLoggedIn" class="empty-state" style="padding-top:100px">
      <div class="icon">👤</div>
      <p>请先登录</p>
      <router-link to="/login" class="btn btn-primary" style="margin-top:16px">去登录</router-link>
    </div>
    <div v-else>
      <div class="profile-header card">
        <img :src="profile.avatar" class="profile-avatar">
        <div class="profile-info">
          <h2>{{ profile.nickname }}</h2>
          <p class="profile-bio">{{ profile.bio || '这个人很懒，还没有介绍' }}</p>
          <div class="profile-meta">
            <span v-if="profile.gender">{{ profile.gender }}</span>
            <span v-if="profile.phone">{{ profile.phone }}</span>
          </div>
        </div>
        <button class="btn btn-outline btn-sm" @click="showEdit = true">编辑资料</button>
      </div>

      <div class="profile-stats">
        <div class="p-stat">
          <div class="p-stat-num">{{ profile.clothesCount || 0 }}</div>
          <div class="p-stat-label">衣物</div>
        </div>
        <div class="p-stat">
          <div class="p-stat-num">{{ profile.outfitsCount || 0 }}</div>
          <div class="p-stat-label">搭配</div>
        </div>
        <div class="p-stat">
          <div class="p-stat-num">{{ profile.sharesCount || 0 }}</div>
          <div class="p-stat-label">分享</div>
        </div>
      </div>

      <div class="section-label">我的功能</div>
      <div class="quick-links">
        <router-link to="/wardrobe" class="quick-link card"><span>👚</span>我的衣橱</router-link>
        <router-link to="/match" class="quick-link card"><span>✨</span>我的搭配</router-link>
        <div class="quick-link card" @click="showCollects = true"><span>⭐</span>我的收藏</div>
        <router-link to="/stats" class="quick-link card"><span>📊</span>衣物统计</router-link>
        <router-link to="/stats" class="quick-link card"><span>📈</span>穿搭分析</router-link>
        <div class="quick-link card" @click="showFeedback = true"><span>💬</span>意见反馈</div>
      </div>

      <div class="section-label">系统设置</div>
      <div class="quick-links">
        <div class="quick-link card" @click="showEdit = true"><span>🔐</span>账号安全</div>
        <div class="quick-link card" @click="showAbout = true"><span>ℹ️</span>关于我们</div>
        <div class="quick-link card" @click="doLogout"><span>🚪</span>退出登录</div>
        <div class="quick-link card" style="color:var(--red)" @click="doDeactivate"><span>⚠️</span>注销账号</div>
      </div>

      <div v-if="showCollects" class="modal-overlay" @click.self="showCollects = false">
        <div class="modal" style="max-width:600px">
          <h2>我的收藏</h2>
          <div v-if="collects.length" class="collect-list">
            <router-link v-for="s in collects" :key="s.id" :to="`/share/${s.id}`" class="collect-item" @click="showCollects = false">
              <img :src="s.images" class="collect-img">
              <div class="collect-info">
                <span class="collect-name">{{ s.nickname }}</span>
                <p class="collect-text">{{ s.content }}</p>
                <div class="collect-stats">
                  <span>❤️ {{ s.likes_count }}</span>
                  <span>💬 {{ s.comments_count }}</span>
                </div>
              </div>
            </router-link>
          </div>
          <div v-else class="empty-state" style="padding:30px"><div class="icon">⭐</div><p>还没有收藏</p></div>
          <div class="modal-actions"><button class="btn btn-ghost" @click="showCollects = false">关闭</button></div>
        </div>
      </div>

      <div v-if="showFeedback" class="modal-overlay" @click.self="showFeedback = false">
        <div class="modal">
          <h2>意见反馈</h2>
          <div class="form-group"><label>反馈类型</label>
            <select v-model="feedbackForm.type"><option value="suggestion">建议</option><option value="complaint">投诉</option></select>
          </div>
          <div class="form-group"><label>反馈内容</label><textarea v-model="feedbackForm.content" rows="4" placeholder="请描述您的建议或问题..."></textarea></div>
          <div class="modal-actions">
            <button class="btn btn-ghost" @click="showFeedback = false">取消</button>
            <button class="btn btn-primary" @click="submitFeedback">提交反馈</button>
          </div>
        </div>
      </div>

      <div v-if="showAbout" class="modal-overlay" @click.self="showAbout = false">
        <div class="modal" style="text-align:center">
          <div style="font-size:48px;margin-bottom:12px">👗</div>
          <h2 style="margin-bottom:8px">衣搭 · 智能穿搭助手</h2>
          <p style="color:var(--text2);font-size:13px;margin-bottom:16px">版本 1.0.0</p>
          <p style="color:var(--text2);font-size:13px;line-height:1.8">基于智能算法的年轻人衣物管理与穿搭搭配系统，帮助你管理衣橱、智能搭配、分享穿搭灵感。</p>
          <div class="modal-actions" style="margin-top:20px"><button class="btn btn-ghost" @click="showAbout = false">关闭</button></div>
        </div>
      </div>

      <div v-if="showEdit" class="modal-overlay" @click.self="showEdit = false">
        <div class="modal">
          <h2>编辑个人资料</h2>
          <div class="form-group"><label>昵称</label><input v-model="editForm.nickname"></div>
          <div class="form-group"><label>头像链接</label><input v-model="editForm.avatar"></div>
          <div class="form-row">
            <div class="form-group"><label>性别</label><select v-model="editForm.gender"><option>男</option><option>女</option><option>保密</option></select></div>
            <div class="form-group"><label>手机号</label><input v-model="editForm.phone"></div>
          </div>
          <div class="form-group"><label>个人简介</label><textarea v-model="editForm.bio" rows="2"></textarea></div>
          <div class="modal-actions">
            <button class="btn btn-ghost" @click="showEdit = false">取消</button>
            <button class="btn btn-primary" @click="saveProfile">保存</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getUser, updateUser, getShares } from '../api'
import { useUser } from '../stores/user'

const router = useRouter()
const userStore = useUser()
const profile = ref({})
const showEdit = ref(false)
const showCollects = ref(false)
const showFeedback = ref(false)
const showAbout = ref(false)
const collects = ref([])
const editForm = reactive({ nickname: '', avatar: '', gender: '', phone: '', bio: '' })
const feedbackForm = reactive({ type: 'suggestion', content: '' })

async function loadProfile() {
  if (!userStore.state.user) return
  const res = await getUser(userStore.state.user.id)
  if (res.code === 200) {
    profile.value = res.data
    Object.assign(editForm, { nickname: res.data.nickname, avatar: res.data.avatar, gender: res.data.gender, phone: res.data.phone, bio: res.data.bio })
  }
  const sharesRes = await getShares()
  if (sharesRes.code === 200) {
    collects.value = sharesRes.data.filter(s => s.collects_count > 0).slice(0, 10)
  }
}

async function saveProfile() {
  await updateUser(userStore.state.user.id, editForm)
  showEdit.value = false
  userStore.setUser({ ...userStore.state.user, ...editForm })
  loadProfile()
}

async function submitFeedback() {
  if (!feedbackForm.content.trim()) return
  try {
    await fetch('/api/feedbacks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userStore.state.user?.id || 1, ...feedbackForm })
    })
    showFeedback.value = false
    feedbackForm.content = ''
    alert('感谢您的反馈！')
  } catch { alert('提交失败，请重试') }
}

function doLogout() {
  userStore.logout()
  router.push('/login')
}

function doDeactivate() {
  if (confirm('确定要注销账号吗？此操作不可恢复，所有数据将被清除。')) {
    if (confirm('再次确认：注销后无法恢复，确定继续？')) {
      userStore.logout()
      alert('账号已注销')
      router.push('/login')
    }
  }
}

onMounted(loadProfile)
</script>

<style scoped>
.profile-header { display: flex; align-items: center; gap: 20px; padding: 28px; margin-top: 24px; }
.profile-avatar { width: 72px; height: 72px; border-radius: 50%; object-fit: cover; border: 3px solid var(--accent-light); }
.profile-info { flex: 1; }
.profile-info h2 { font-size: 20px; font-weight: 700; }
.profile-bio { font-size: 13px; color: var(--text2); margin-top: 4px; }
.profile-meta { display: flex; gap: 12px; margin-top: 6px; font-size: 12px; color: var(--text3); }

.profile-stats { display: flex; justify-content: center; gap: 48px; padding: 24px; }
.p-stat { text-align: center; }
.p-stat-num { font-size: 28px; font-weight: 700; color: var(--accent-dark); }
.p-stat-label { font-size: 13px; color: var(--text2); margin-top: 2px; }

.section-label { font-size: 15px; font-weight: 600; color: var(--text); margin: 24px 0 12px; padding-left: 4px; }

.quick-links { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.quick-link { display: flex; align-items: center; gap: 12px; padding: 18px 20px; font-size: 15px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.quick-link:hover { transform: translateX(4px); border-color: var(--accent); }
.quick-link span { font-size: 22px; }

.collect-list { display: flex; flex-direction: column; gap: 12px; max-height: 400px; overflow-y: auto; }
.collect-item { display: flex; gap: 14px; padding: 10px; border-radius: 10px; background: var(--bg); transition: background 0.2s; }
.collect-item:hover { background: var(--accent-light); }
.collect-img { width: 70px; height: 70px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
.collect-info { flex: 1; }
.collect-name { font-size: 13px; font-weight: 600; display: block; margin-bottom: 4px; }
.collect-text { font-size: 12px; color: var(--text2); line-height: 1.5; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; margin-bottom: 4px; }
.collect-stats { display: flex; gap: 12px; font-size: 11px; color: var(--text3); }

@media (max-width: 768px) { .quick-links { grid-template-columns: repeat(2, 1fr); } }
</style>
