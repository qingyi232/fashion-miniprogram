const cloud = require('wx-server-sdk')
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV })
const db = cloud.database()
const _ = db.command

exports.main = async (event, context) => {
  const { action, data } = event
  const wxContext = cloud.getWXContext()

  switch (action) {
    case 'login': return await login(data, wxContext)
    case 'getUser': return await getUser(data)
    case 'updateUser': return await updateUser(data)
    default: return { code: 400, message: '未知操作' }
  }
}

const DEMO_USERS = {
  'wx_user_001': { nickname: '林小鹿', avatar: 'https://picsum.photos/seed/user_deer/100/100', role: 'user', bio: '时尚达人' },
  'wx_user_002': { nickname: '陈一帆', avatar: 'https://picsum.photos/seed/user_fan/100/100', role: 'user', bio: '极简主义' },
  'wx_user_003': { nickname: '苏晚晴', avatar: 'https://picsum.photos/seed/user_qing/100/100', role: 'user', bio: '日系博主' },
  'wx_user_004': { nickname: '周子墨', avatar: 'https://picsum.photos/seed/user_mo/100/100', role: 'user', bio: '街头潮流' },
  'wx_user_005': { nickname: '沈悦然', avatar: 'https://picsum.photos/seed/user_ran/100/100', role: 'user', bio: '法式穿搭' },
  'wx_admin_001': { nickname: '管理员', avatar: 'https://picsum.photos/seed/user_admin/100/100', role: 'admin', bio: '系统管理员' }
}

async function login(data, wxContext) {
  const openid = (data && data.openid) || wxContext.OPENID
  const { data: users } = await db.collection('users').where({ openid }).get()

  if (users.length > 0) {
    const user = users[0]
    user.id = user._id
    return { code: 200, data: user }
  }

  const demo = DEMO_USERS[openid]
  const newUser = {
    openid,
    nickname: demo ? demo.nickname : '新用户',
    avatar: demo ? demo.avatar : '',
    gender: '',
    phone: '',
    bio: demo ? demo.bio : '',
    role: demo ? demo.role : 'user',
    status: 'active',
    created_at: db.serverDate()
  }
  const res = await db.collection('users').add({ data: newUser })
  newUser._id = res._id
  newUser.id = res._id

  await db.collection('logs').add({
    data: { action: '用户注册', detail: `${newUser.nickname} 注册`, operator: 'user', created_at: db.serverDate() }
  })

  return { code: 200, data: newUser }
}

async function getUser(data) {
  const { id } = data || {}
  if (!id) return { code: 400, message: '缺少用户ID' }
  const { data: users } = await db.collection('users').where({ _id: id }).get()
  if (!users.length) return { code: 404, message: '用户不存在' }

  const user = users[0]
  const clothesCount = (await db.collection('clothes').where({ user_id: id }).count()).total
  const outfitsCount = (await db.collection('outfits').where({ user_id: id }).count()).total
  const sharesCount = (await db.collection('shares').where({ user_id: id }).count()).total

  return { code: 200, data: { ...user, id: user._id, clothesCount, outfitsCount, sharesCount } }
}

async function updateUser(data) {
  const { id, nickname, avatar, gender, phone, bio } = data
  await db.collection('users').doc(id).update({
    data: { nickname, avatar, gender, phone, bio }
  })
  return { code: 200, message: '更新成功' }
}
