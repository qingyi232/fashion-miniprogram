<template>
  <div class="container" v-if="share">
    <div class="detail-layout">
      <div class="detail-img-wrap">
        <img :src="share.images" class="detail-img" alt="">
      </div>
      <div class="detail-content">
        <div class="detail-user">
          <img :src="share.avatar" class="detail-avatar">
          <div>
            <span class="detail-nickname">{{ share.nickname }}</span>
            <span class="detail-time">{{ share.created_at?.substring(0,10) }}</span>
          </div>
        </div>
        <p class="detail-text">{{ share.content }}</p>
        <div class="detail-tags">
          <span v-for="t in allTags" :key="t" class="tag">{{ t }}</span>
        </div>
        <div class="detail-actions">
          <button class="action-btn" @click="doLike"><span>❤️</span> {{ share.likes_count }}</button>
          <button class="action-btn" @click="doCollect"><span>⭐</span> {{ share.collects_count }}</button>
        </div>

        <div class="comments-section">
          <h3>评论（{{ share.comments?.length || 0 }}）</h3>
          <div class="comment-input">
            <input v-model="commentText" placeholder="写下你的评论..." @keyup.enter="doComment">
            <button class="btn btn-sm btn-primary" @click="doComment">发送</button>
          </div>
          <div class="comment-list">
            <div v-for="c in share.comments" :key="c.id" class="comment-item">
              <img :src="c.avatar" class="comment-avatar">
              <div class="comment-body">
                <span class="comment-name">{{ c.nickname }}</span>
                <p class="comment-text">{{ c.content }}</p>
                <div class="comment-footer">
                  <span class="comment-time">{{ c.created_at?.substring(0,16) }}</span>
                  <button class="reply-btn" @click="replyTo = replyTo === c.id ? null : c.id">回复</button>
                </div>
                <div v-if="replyTo === c.id" class="reply-input">
                  <input v-model="replyText" :placeholder="`回复 ${c.nickname}...`" @keyup.enter="doReply(c)">
                  <button class="btn btn-sm btn-primary" @click="doReply(c)">发送</button>
                </div>
                <div v-for="r in getReplies(c.id)" :key="r.id" class="reply-item">
                  <img :src="r.avatar" class="reply-avatar">
                  <div>
                    <span class="reply-name">{{ r.nickname }}</span>
                    <span class="reply-text">{{ r.content }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { getShareDetail, likeShare, collectShare, commentShare } from '../api'
import { useUser } from '../stores/user'

const route = useRoute()
const user = useUser()
const share = ref(null)
const commentText = ref('')
const replyTo = ref(null)
const replyText = ref('')

function getReplies(parentId) {
  if (!share.value?.comments) return []
  return share.value.comments.filter(c => c.parent_id === parentId)
}

async function doReply(parentComment) {
  if (!replyText.value.trim()) return
  await commentShare(route.params.id, { user_id: user.state.user?.id || 1, content: replyText.value, parent_id: parentComment.id })
  replyText.value = ''
  replyTo.value = null
  load()
}

const allTags = computed(() => {
  if (!share.value) return []
  return [...(share.value.style_tags || '').split(','), ...(share.value.occasion_tags || '').split(',')].filter(Boolean)
})

async function load() {
  const res = await getShareDetail(route.params.id)
  if (res.code === 200) share.value = res.data
}

async function doLike() {
  await likeShare(route.params.id, user.state.user?.id || 1)
  load()
}

async function doCollect() {
  await collectShare(route.params.id, user.state.user?.id || 1)
  load()
}

async function doComment() {
  if (!commentText.value.trim()) return
  await commentShare(route.params.id, { user_id: user.state.user?.id || 1, content: commentText.value })
  commentText.value = ''
  load()
}

onMounted(load)
</script>

<style scoped>
.detail-layout { display: flex; gap: 40px; padding: 32px 0; }
.detail-img-wrap { flex: 0 0 480px; }
.detail-img { width: 100%; border-radius: var(--radius-lg); box-shadow: var(--shadow-lg); }
.detail-content { flex: 1; }

.detail-user { display: flex; align-items: center; gap: 12px; margin-bottom: 20px; }
.detail-avatar { width: 44px; height: 44px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-light); }
.detail-nickname { display: block; font-size: 16px; font-weight: 600; }
.detail-time { display: block; font-size: 12px; color: var(--text3); }
.detail-text { font-size: 15px; line-height: 1.8; color: var(--text); margin-bottom: 16px; }
.detail-tags { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 20px; }

.detail-actions { display: flex; gap: 12px; margin-bottom: 32px; }
.action-btn { display: flex; align-items: center; gap: 6px; padding: 10px 20px; border-radius: 8px; border: 1.5px solid var(--border); background: var(--card); font-size: 14px; cursor: pointer; transition: all 0.2s; }
.action-btn:hover { border-color: var(--accent); background: var(--accent-light); }

.comments-section h3 { font-size: 16px; font-weight: 600; margin-bottom: 16px; }
.comment-input { display: flex; gap: 10px; margin-bottom: 20px; }
.comment-input input { flex: 1; padding: 10px 14px; border-radius: 8px; border: 1.5px solid var(--border); background: var(--bg); outline: none; font-size: 14px; }
.comment-input input:focus { border-color: var(--accent); }

.comment-list { display: flex; flex-direction: column; gap: 16px; }
.comment-item { display: flex; gap: 12px; }
.comment-avatar { width: 36px; height: 36px; border-radius: 50%; object-fit: cover; flex-shrink: 0; }
.comment-body { flex: 1; }
.comment-name { font-size: 13px; font-weight: 600; color: var(--text); }
.comment-text { font-size: 14px; color: var(--text2); margin: 4px 0; line-height: 1.5; }
.comment-footer { display: flex; align-items: center; gap: 12px; }
.comment-time { font-size: 11px; color: var(--text3); }
.reply-btn { background: none; border: none; font-size: 12px; color: var(--accent); cursor: pointer; }
.reply-btn:hover { text-decoration: underline; }
.reply-input { display: flex; gap: 8px; margin-top: 8px; }
.reply-input input { flex: 1; padding: 6px 10px; border-radius: 6px; border: 1px solid var(--border); font-size: 13px; outline: none; }
.reply-item { display: flex; align-items: flex-start; gap: 8px; margin-top: 8px; padding: 8px 10px; background: var(--bg); border-radius: 8px; }
.reply-avatar { width: 24px; height: 24px; border-radius: 50%; object-fit: cover; }
.reply-name { font-size: 12px; font-weight: 600; color: var(--accent-dark); margin-right: 6px; }
.reply-text { font-size: 13px; color: var(--text2); }

@media (max-width: 768px) { .detail-layout { flex-direction: column; gap: 20px; } .detail-img-wrap { flex: none; } }
</style>
