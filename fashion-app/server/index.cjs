const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json({ limit: '10mb' }));

const db = new Database(path.join(__dirname, 'fashion.db'));
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    openid TEXT UNIQUE,
    nickname TEXT NOT NULL,
    avatar TEXT,
    gender TEXT DEFAULT '',
    phone TEXT DEFAULT '',
    bio TEXT DEFAULT '',
    role TEXT DEFAULT 'user',
    status TEXT DEFAULT 'active',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS clothes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    season TEXT DEFAULT '',
    occasion TEXT DEFAULT '',
    color TEXT DEFAULT '',
    brand TEXT DEFAULT '',
    image TEXT,
    is_favorite INTEGER DEFAULT 0,
    wear_count INTEGER DEFAULT 0,
    last_worn DATE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS outfits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    occasion TEXT DEFAULT '',
    weather TEXT DEFAULT '',
    season TEXT DEFAULT '',
    style TEXT DEFAULT '',
    items TEXT NOT NULL,
    preview_image TEXT,
    is_auto INTEGER DEFAULT 0,
    is_public INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS shares (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    outfit_id INTEGER,
    content TEXT DEFAULT '',
    images TEXT,
    style_tags TEXT DEFAULT '',
    occasion_tags TEXT DEFAULT '',
    visibility TEXT DEFAULT 'public',
    status TEXT DEFAULT 'approved',
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    collects_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (outfit_id) REFERENCES outfits(id)
  );

  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    share_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    content TEXT NOT NULL,
    parent_id INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (share_id) REFERENCES shares(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS likes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    share_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(share_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS collects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    share_id INTEGER NOT NULL,
    user_id INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(share_id, user_id)
  );

  CREATE TABLE IF NOT EXISTS announcements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS feedbacks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    type TEXT DEFAULT 'feedback',
    content TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    reply TEXT DEFAULT '',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    action TEXT NOT NULL,
    detail TEXT DEFAULT '',
    operator TEXT DEFAULT 'system',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// ========== SEED DATA ==========
const userCount = db.prepare('SELECT COUNT(*) as c FROM users').get();
if (userCount.c === 0) {
  const insertUser = db.prepare('INSERT INTO users (openid, nickname, avatar, gender, phone, bio, role) VALUES (?,?,?,?,?,?,?)');
  insertUser.run('wx_user_001', '林小鹿', 'https://picsum.photos/seed/user_deer/100/100', '女', '138****1234', '热爱穿搭的时尚达人，分享每日OOTD', 'user');
  insertUser.run('wx_user_002', '陈一帆', 'https://picsum.photos/seed/user_fan/100/100', '男', '139****5678', '极简主义穿搭爱好者', 'user');
  insertUser.run('wx_user_003', '苏晚晴', 'https://picsum.photos/seed/user_qing/100/100', '女', '137****9012', '日系穿搭博主，记录生活中的小美好', 'user');
  insertUser.run('wx_user_004', '周子墨', 'https://picsum.photos/seed/user_mo/100/100', '男', '136****3456', '街头风格穿搭，潮流不止', 'user');
  insertUser.run('wx_user_005', '沈悦然', 'https://picsum.photos/seed/user_ran/100/100', '女', '135****7890', '法式优雅穿搭记录', 'user');
  insertUser.run('wx_admin_001', '管理员', 'https://picsum.photos/seed/user_admin/100/100', '', '', '系统管理员', 'admin');

  const insertClothes = db.prepare('INSERT INTO clothes (user_id, name, category, season, occasion, color, brand, image, is_favorite, wear_count, last_worn) VALUES (?,?,?,?,?,?,?,?,?,?,?)');
  
  insertClothes.run(1, '白色基础T恤', '上衣', '春秋', '日常', '白色', 'UNIQLO', 'https://picsum.photos/seed/white_tshirt/400/500', 1, 28, '2026-04-25');
  insertClothes.run(1, '浅蓝色牛仔裤', '裤装', '四季', '日常', '蓝色', 'Levis', 'https://picsum.photos/seed/blue_jeans/400/500', 1, 22, '2026-04-24');
  insertClothes.run(1, '米色针织开衫', '外套', '春秋', '日常', '米色', 'ZARA', 'https://picsum.photos/seed/beige_cardigan/400/500', 0, 15, '2026-04-20');
  insertClothes.run(1, '碎花连衣裙', '裙装', '夏季', '约会', '粉色', 'MO&Co', 'https://picsum.photos/seed/floral_dress/400/500', 1, 8, '2026-04-18');
  insertClothes.run(1, '黑色西装外套', '外套', '春秋', '正式', '黑色', 'Theory', 'https://picsum.photos/seed/black_blazer/400/500', 0, 5, '2026-04-10');
  insertClothes.run(1, '白色帆布鞋', '鞋子', '四季', '日常', '白色', 'Converse', 'https://picsum.photos/seed/white_canvas/400/500', 1, 30, '2026-04-25');
  insertClothes.run(1, '棕色托特包', '包包', '四季', '通勤', '棕色', 'Coach', 'https://picsum.photos/seed/brown_tote/400/500', 0, 12, '2026-04-22');
  insertClothes.run(1, '条纹衬衫', '上衣', '春秋', '通勤', '蓝白', 'GAP', 'https://picsum.photos/seed/stripe_shirt/400/500', 0, 10, '2026-04-15');
  insertClothes.run(1, '卡其色风衣', '外套', '春秋', '通勤', '卡其色', 'Burberry', 'https://picsum.photos/seed/khaki_trench/400/500', 1, 6, '2026-04-12');
  insertClothes.run(1, '黑色小脚裤', '裤装', '四季', '通勤', '黑色', 'COS', 'https://picsum.photos/seed/black_pants/400/500', 0, 18, '2026-04-23');
  insertClothes.run(1, '粉色毛衣', '上衣', '冬季', '日常', '粉色', 'H&M', 'https://picsum.photos/seed/pink_sweater/400/500', 0, 9, '2026-03-15');
  insertClothes.run(1, '白色半裙', '裙装', '夏季', '日常', '白色', 'ZARA', 'https://picsum.photos/seed/white_skirt/400/500', 0, 4, '2026-04-05');

  insertClothes.run(2, '黑色圆领T恤', '上衣', '夏季', '日常', '黑色', 'MUJI', 'https://picsum.photos/seed/black_tee/400/500', 1, 20, '2026-04-25');
  insertClothes.run(2, '深蓝色直筒裤', '裤装', '四季', '日常', '深蓝', 'Levis', 'https://picsum.photos/seed/navy_jeans/400/500', 0, 16, '2026-04-24');
  insertClothes.run(2, '灰色连帽卫衣', '上衣', '春秋', '运动', '灰色', 'Nike', 'https://picsum.photos/seed/grey_hoodie/400/500', 1, 14, '2026-04-22');
  insertClothes.run(2, '白色运动鞋', '鞋子', '四季', '运动', '白色', 'Nike', 'https://picsum.photos/seed/white_sneaker/400/500', 0, 25, '2026-04-25');

  insertClothes.run(3, '奶茶色针织衫', '上衣', '春秋', '日常', '奶茶色', 'earth music', 'https://picsum.photos/seed/milktea_knit/400/500', 1, 12, '2026-04-24');
  insertClothes.run(3, '米白色阔腿裤', '裤装', '春秋', '日常', '米白', 'GU', 'https://picsum.photos/seed/cream_wide/400/500', 0, 10, '2026-04-23');
  insertClothes.run(3, '碎花半裙', '裙装', '夏季', '约会', '碎花', 'Snidel', 'https://picsum.photos/seed/floral_skirt/400/500', 1, 7, '2026-04-20');
  insertClothes.run(3, '棕色乐福鞋', '鞋子', '春秋', '日常', '棕色', 'Clarks', 'https://picsum.photos/seed/brown_loafer/400/500', 0, 15, '2026-04-24');

  insertClothes.run(4, '黑色机能外套', '外套', '春秋', '日常', '黑色', 'ACW', 'https://picsum.photos/seed/tech_jacket/400/500', 1, 18, '2026-04-25');
  insertClothes.run(4, '白色oversize T恤', '上衣', '夏季', '日常', '白色', 'Stussy', 'https://picsum.photos/seed/oversize_tee/400/500', 0, 15, '2026-04-24');
  insertClothes.run(4, '工装束脚裤', '裤装', '四季', '日常', '军绿', 'Carhartt', 'https://picsum.photos/seed/cargo_pant/400/500', 1, 12, '2026-04-22');
  insertClothes.run(4, 'AJ1高帮球鞋', '鞋子', '四季', '日常', '黑红', 'Nike', 'https://picsum.photos/seed/jordan_shoe/400/500', 1, 20, '2026-04-25');

  insertClothes.run(5, '白色丝绸衬衫', '上衣', '春秋', '约会', '白色', 'Sandro', 'https://picsum.photos/seed/silk_blouse/400/500', 1, 10, '2026-04-24');
  insertClothes.run(5, '高腰直筒裤', '裤装', '四季', '通勤', '卡其色', 'Massimo Dutti', 'https://picsum.photos/seed/highwaist_pant/400/500', 0, 8, '2026-04-23');
  insertClothes.run(5, '小香风外套', '外套', '春秋', '正式', '米白', 'Maje', 'https://picsum.photos/seed/chanel_coat/400/500', 1, 6, '2026-04-20');
  insertClothes.run(5, '尖头高跟鞋', '鞋子', '四季', '正式', '裸粉', 'Jimmy Choo', 'https://picsum.photos/seed/pointed_heels/400/500', 0, 9, '2026-04-22');
  insertClothes.run(5, '丝绒小方包', '包包', '四季', '约会', '酒红', 'YSL', 'https://picsum.photos/seed/velvet_purse/400/500', 1, 7, '2026-04-21');

  const insertOutfit = db.prepare('INSERT INTO outfits (user_id, title, occasion, weather, season, style, items, is_auto, is_public, created_at) VALUES (?,?,?,?,?,?,?,?,?,?)');
  insertOutfit.run(1, '清新日常通勤look', '通勤', '晴天', '春季', '简约', JSON.stringify([1,2,6,7]), 0, 1, '2026-04-20');
  insertOutfit.run(1, '周末约会甜美风', '约会', '晴天', '春季', '甜美', JSON.stringify([4,6,7]), 0, 1, '2026-04-18');
  insertOutfit.run(1, '知性通勤穿搭', '通勤', '阴天', '春季', '知性', JSON.stringify([8,10,5,7]), 1, 1, '2026-04-22');
  insertOutfit.run(1, '春日出游搭配', '休闲', '晴天', '春季', '休闲', JSON.stringify([1,2,3,6]), 1, 0, '2026-04-15');
  insertOutfit.run(2, '极简黑白配', '日常', '晴天', '夏季', '极简', JSON.stringify([13,14,16]), 0, 1, '2026-04-23');
  insertOutfit.run(2, '运动休闲风', '运动', '晴天', '春季', '运动', JSON.stringify([15,14,16]), 1, 1, '2026-04-21');
  insertOutfit.run(3, '日系温柔穿搭', '日常', '晴天', '春季', '日系', JSON.stringify([17,18,20]), 0, 1, '2026-04-24');
  insertOutfit.run(3, '甜美约会look', '约会', '晴天', '夏季', '甜美', JSON.stringify([17,19,20]), 0, 1, '2026-04-19');
  insertOutfit.run(4, '街头潮流穿搭', '日常', '晴天', '春季', '街头', JSON.stringify([21,22,23,24]), 0, 1, '2026-04-22');
  insertOutfit.run(5, '法式约会穿搭', '约会', '晴天', '春季', '法式', JSON.stringify([25,26,28,29]), 0, 1, '2026-04-23');
  insertOutfit.run(5, '知性通勤look', '通勤', '阴天', '春季', '优雅', JSON.stringify([25,26,27,28]), 1, 1, '2026-04-21');

  const insertShare = db.prepare('INSERT INTO shares (user_id, outfit_id, content, images, style_tags, occasion_tags, visibility, status, likes_count, comments_count, collects_count, created_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)');
  insertShare.run(1, 1, '今日份的通勤穿搭～白T配牛仔裤永远不会出错！搭一件米色开衫刚好应对办公室的空调，简约又舒适✨', 'https://picsum.photos/seed/ootd_commute/600/800', '简约,通勤', '通勤,日常', 'public', 'approved', 32, 5, 12, '2026-04-20');
  insertShare.run(1, 2, '周末约会穿了这条碎花裙，春天就是要穿得美美的出门呀🌸', 'https://picsum.photos/seed/ootd_date/600/800', '甜美,约会', '约会', 'public', 'approved', 58, 8, 25, '2026-04-18');
  insertShare.run(2, 5, '黑白配是男生最不容易出错的搭配，简单干净就很好看👔', 'https://picsum.photos/seed/ootd_minimal/600/800', '极简,基础', '日常', 'public', 'approved', 45, 6, 18, '2026-04-23');
  insertShare.run(3, 7, '今天的日系温柔穿搭～奶茶色系真的太好看啦，搭配阔腿裤和乐福鞋，休闲又有气质🍵', 'https://picsum.photos/seed/ootd_japanese/600/800', '日系,温柔', '日常,休闲', 'public', 'approved', 67, 10, 30, '2026-04-24');
  insertShare.run(1, 3, '知性通勤穿搭分享～条纹衬衫+黑色小脚裤+西装外套，正式场合也能穿得优雅从容💼', 'https://picsum.photos/seed/ootd_formal/600/800', '知性,通勤', '通勤,正式', 'public', 'approved', 41, 4, 15, '2026-04-22');
  insertShare.run(4, 9, '街头风格穿搭，机能外套+工装裤+AJ1，简单粗暴但就是好看🔥', 'https://picsum.photos/seed/ootd_street/600/800', '街头,潮流', '日常,休闲', 'public', 'approved', 36, 5, 14, '2026-04-22');
  insertShare.run(5, 10, '法式慵懒风穿搭～简单的白衬衫配高腰裤，加一条丝巾就很有味道了🇫🇷', 'https://picsum.photos/seed/ootd_french/600/800', '法式,优雅', '日常,约会', 'public', 'approved', 89, 15, 42, '2026-04-25');

  const insertComment = db.prepare('INSERT INTO comments (share_id, user_id, content, created_at) VALUES (?,?,?,?)');
  insertComment.run(1, 2, '好看！这个搭配很适合春天～', '2026-04-20 10:30:00');
  insertComment.run(1, 3, '白T配牛仔裤真的是永远的经典！', '2026-04-20 14:20:00');
  insertComment.run(2, 3, '裙子好好看！请问在哪里买的呀？', '2026-04-18 16:00:00');
  insertComment.run(2, 4, '春天就应该穿得美美的！', '2026-04-18 18:30:00');
  insertComment.run(4, 1, '日系穿搭太温柔了，学到了！', '2026-04-24 09:15:00');
  insertComment.run(4, 5, '奶茶色系好显白，收藏了～', '2026-04-24 11:00:00');
  insertComment.run(6, 1, '法式穿搭永远的神！丝巾点睛之笔', '2026-04-25 10:00:00');
  insertComment.run(6, 3, '好优雅！请问丝巾是什么品牌？', '2026-04-25 12:30:00');
  insertComment.run(3, 1, '黑白配简约又帅气！', '2026-04-23 15:00:00');
  insertComment.run(5, 2, '通勤穿搭可以直接抄作业了～', '2026-04-22 17:00:00');

  const insertAnn = db.prepare('INSERT INTO announcements (title, content, is_active, created_at) VALUES (?,?,?,?)');
  insertAnn.run('春季穿搭大赛开始啦！', '分享你的春日穿搭，赢取精美好礼～活动时间：4月20日-5月20日', 1, '2026-04-20');
  insertAnn.run('系统升级通知', '系统将于4月28日凌晨2:00-4:00进行维护升级，届时部分功能可能暂时不可用', 1, '2026-04-26');

  const insertFeedback = db.prepare('INSERT INTO feedbacks (user_id, type, content, status, reply, created_at) VALUES (?,?,?,?,?,?)');
  insertFeedback.run(1, 'suggestion', '希望可以增加AI识别衣物类型的功能', 'replied', '感谢您的建议，我们已在规划中！', '2026-04-15');
  insertFeedback.run(3, 'complaint', '图片上传偶尔会失败', 'pending', '', '2026-04-22');
  insertFeedback.run(4, 'suggestion', '能不能增加好友功能，可以互相关注', 'pending', '', '2026-04-24');

  const insertLog = db.prepare('INSERT INTO logs (action, detail, operator, created_at) VALUES (?,?,?,?)');
  insertLog.run('系统启动', '系统正常启动', 'system', '2026-04-25 08:00:00');
  insertLog.run('用户登录', '用户 林小鹿 登录系统', 'user', '2026-04-25 09:00:00');
  insertLog.run('内容审核', '审核通过穿搭分享 #6', 'admin', '2026-04-25 10:00:00');
  insertLog.run('数据备份', '数据库自动备份完成', 'system', '2026-04-25 02:00:00');
}

// ========== AUTH API ==========
app.post('/api/login', (req, res) => {
  const { openid } = req.body;
  if (!openid) return res.json({ code: 400, message: '缺少openid' });
  let user = db.prepare('SELECT * FROM users WHERE openid = ?').get(openid);
  if (!user) {
    db.prepare('INSERT INTO users (openid, nickname, avatar) VALUES (?, ?, ?)').run(openid, '新用户', '');
    user = db.prepare('SELECT * FROM users WHERE openid = ?').get(openid);
  }
  db.prepare('INSERT INTO logs (action, detail, operator) VALUES (?,?,?)').run('用户登录', `用户 ${user.nickname} 登录`, 'user');
  res.json({ code: 200, data: user });
});

app.get('/api/users/:id', (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.json({ code: 404, message: '用户不存在' });
  const clothesCount = db.prepare('SELECT COUNT(*) as c FROM clothes WHERE user_id = ?').get(req.params.id).c;
  const outfitsCount = db.prepare('SELECT COUNT(*) as c FROM outfits WHERE user_id = ?').get(req.params.id).c;
  const sharesCount = db.prepare('SELECT COUNT(*) as c FROM shares WHERE user_id = ?').get(req.params.id).c;
  res.json({ code: 200, data: { ...user, clothesCount, outfitsCount, sharesCount } });
});

app.put('/api/users/:id', (req, res) => {
  const { nickname, avatar, gender, phone, bio } = req.body;
  db.prepare('UPDATE users SET nickname=?, avatar=?, gender=?, phone=?, bio=? WHERE id=?').run(nickname, avatar, gender, phone, bio, req.params.id);
  res.json({ code: 200, message: '更新成功' });
});

// ========== CLOTHES API ==========
app.get('/api/clothes', (req, res) => {
  const { user_id, category, season, occasion, color, keyword } = req.query;
  let sql = 'SELECT * FROM clothes WHERE 1=1';
  const params = [];
  if (user_id) { sql += ' AND user_id = ?'; params.push(user_id); }
  if (category) { sql += ' AND category = ?'; params.push(category); }
  if (season) { sql += " AND (season = ? OR season = '四季')"; params.push(season); }
  if (occasion) { sql += ' AND occasion = ?'; params.push(occasion); }
  if (color) { sql += ' AND color LIKE ?'; params.push(`%${color}%`); }
  if (keyword) { sql += ' AND (name LIKE ? OR brand LIKE ?)'; params.push(`%${keyword}%`, `%${keyword}%`); }
  sql += ' ORDER BY created_at DESC';
  const clothes = db.prepare(sql).all(...params);
  res.json({ code: 200, data: clothes });
});

app.post('/api/clothes', (req, res) => {
  const { user_id, name, category, season, occasion, color, brand, image } = req.body;
  const result = db.prepare('INSERT INTO clothes (user_id, name, category, season, occasion, color, brand, image) VALUES (?,?,?,?,?,?,?,?)').run(user_id, name, category, season, occasion, color, brand, image);
  res.json({ code: 200, data: { id: result.lastInsertRowid }, message: '添加成功' });
});

app.put('/api/clothes/:id', (req, res) => {
  const { name, category, season, occasion, color, brand, image, is_favorite } = req.body;
  db.prepare('UPDATE clothes SET name=?, category=?, season=?, occasion=?, color=?, brand=?, image=?, is_favorite=? WHERE id=?').run(name, category, season, occasion, color, brand, image, is_favorite ? 1 : 0, req.params.id);
  res.json({ code: 200, message: '更新成功' });
});

app.delete('/api/clothes/:id', (req, res) => {
  db.prepare('DELETE FROM clothes WHERE id = ?').run(req.params.id);
  res.json({ code: 200, message: '删除成功' });
});

app.put('/api/clothes/:id/favorite', (req, res) => {
  const item = db.prepare('SELECT is_favorite FROM clothes WHERE id = ?').get(req.params.id);
  if (!item) return res.json({ code: 404 });
  db.prepare('UPDATE clothes SET is_favorite = ? WHERE id = ?').run(item.is_favorite ? 0 : 1, req.params.id);
  res.json({ code: 200, data: { is_favorite: !item.is_favorite } });
});

app.put('/api/clothes/:id/wear', (req, res) => {
  db.prepare('UPDATE clothes SET wear_count = wear_count + 1, last_worn = date("now") WHERE id = ?').run(req.params.id);
  res.json({ code: 200, message: '记录穿着' });
});

// ========== OUTFITS API ==========
app.get('/api/outfits', (req, res) => {
  const { user_id, occasion, style } = req.query;
  let sql = 'SELECT * FROM outfits WHERE 1=1';
  const params = [];
  if (user_id) { sql += ' AND user_id = ?'; params.push(user_id); }
  if (occasion) { sql += ' AND occasion = ?'; params.push(occasion); }
  if (style) { sql += ' AND style = ?'; params.push(style); }
  sql += ' ORDER BY created_at DESC';
  const outfits = db.prepare(sql).all(...params);
  outfits.forEach(o => { if (o.items) o.items = JSON.parse(o.items); });
  res.json({ code: 200, data: outfits });
});

app.post('/api/outfits', (req, res) => {
  const { user_id, title, occasion, weather, season, style, items, is_auto, is_public } = req.body;
  const result = db.prepare('INSERT INTO outfits (user_id, title, occasion, weather, season, style, items, is_auto, is_public) VALUES (?,?,?,?,?,?,?,?,?)').run(user_id, title, occasion, weather, season, style, JSON.stringify(items), is_auto ? 1 : 0, is_public ? 1 : 0);
  res.json({ code: 200, data: { id: result.lastInsertRowid }, message: '保存成功' });
});

app.delete('/api/outfits/:id', (req, res) => {
  db.prepare('DELETE FROM outfits WHERE id = ?').run(req.params.id);
  res.json({ code: 200, message: '删除成功' });
});

app.post('/api/outfits/generate', (req, res) => {
  const { user_id, occasion, weather, season } = req.body;
  if (!user_id) return res.json({ code: 400, message: '缺少用户ID' });

  const allClothes = db.prepare('SELECT * FROM clothes WHERE user_id = ?').all(user_id);
  if (allClothes.length < 2) return res.json({ code: 200, data: [], message: '衣物数量不足' });

  // === 规则引擎：基于衣物属性的多维度搭配规则 ===

  const seasonMap = {
    '春季': ['春秋','春季','四季'],
    '夏季': ['夏季','四季'],
    '秋季': ['春秋','秋季','四季'],
    '冬季': ['冬季','四季']
  };

  const colorHarmony = {
    '白色': ['黑色','蓝色','米色','粉色','卡其色','灰色','深蓝','奶茶色'],
    '黑色': ['白色','灰色','红色','粉色','蓝白','卡其色','黑红'],
    '蓝色': ['白色','米色','黑色','蓝白','灰色'],
    '粉色': ['白色','米色','灰色','米白','黑色'],
    '米色': ['白色','棕色','蓝色','深蓝','卡其色','奶茶色'],
    '灰色': ['白色','黑色','粉色','蓝色','深蓝'],
    '卡其色': ['白色','黑色','棕色','米色','深蓝','军绿'],
    '奶茶色': ['米白','白色','棕色','米色','灰色'],
    '军绿': ['白色','黑色','黑红','棕色','卡其色'],
    '蓝白': ['黑色','蓝色','米色','白色','卡其色'],
    '米白': ['奶茶色','粉色','棕色','灰色','蓝色'],
    '深蓝': ['白色','米色','灰色','卡其色'],
    '棕色': ['白色','米色','卡其色','奶茶色','军绿'],
    '碎花': ['白色','米色','米白','棕色'],
    '黑红': ['黑色','白色','军绿','灰色'],
    '酒红': ['黑色','白色','米色','灰色'],
    '裸粉': ['白色','米白','米色','灰色']
  };

  const occasionStyle = {
    '日常': ['休闲','极简','日系','街头'],
    '通勤': ['知性','简约','优雅','都市'],
    '约会': ['甜美','法式','温柔','浪漫'],
    '正式': ['知性','优雅','经典','商务'],
    '运动': ['运动','活力','街头','休闲'],
    '休闲': ['休闲','极简','街头','日系']
  };

  const weatherColorPrefer = {
    '晴天': ['白色','粉色','蓝色','米色','碎花','浅蓝','米白','奶茶色','裸粉'],
    '阴天': ['灰色','黑色','深蓝','军绿','卡其色','棕色','酒红'],
    '雨天': ['黑色','深蓝','灰色','军绿','卡其色'],
    '大风': ['黑色','灰色','深蓝','军绿','卡其色','棕色']
  };

  const needOuter = weather === '阴天' || weather === '雨天' || weather === '大风' || season === '冬季' || season === '秋季';

  function seasonMatch(itemSeason) {
    if (!season) return 1;
    const matched = seasonMap[season] || [season, '四季'];
    if (itemSeason === season) return 3;
    if (itemSeason === '四季') return 1.5;
    if (matched.includes(itemSeason)) return 2;
    return 0;
  }

  function occasionMatch(itemOccasion) {
    if (!occasion) return 1;
    if (itemOccasion === occasion) return 3;
    if (itemOccasion === '日常') return 1;
    return 0.3;
  }

  function colorScore(c1, c2) {
    const harmonious = colorHarmony[c1] || [];
    if (harmonious.includes(c2)) return 3;
    if (c1 === c2) return 1.2;
    return 1.5;
  }

  function weatherColorBonus(color) {
    if (!weather) return 0;
    const preferred = weatherColorPrefer[weather] || [];
    return preferred.includes(color) ? 5 : 0;
  }

  // === 协同过滤算法：基于用户行为的个性化推荐 ===

  let cfCategoryPrefer = {};
  let cfColorPrefer = {};
  try {
    const similarUserOutfits = db.prepare(
      `SELECT o.items FROM outfits o
       WHERE o.user_id != ? AND (o.occasion = ? OR o.season = ?)
       ORDER BY o.created_at DESC LIMIT 20`
    ).all(user_id, occasion || '日常', season || '春季');

    const cfItemIds = [];
    similarUserOutfits.forEach(o => {
      try { cfItemIds.push(...JSON.parse(o.items)); } catch(e) {}
    });

    if (cfItemIds.length) {
      const placeholders = cfItemIds.map(() => '?').join(',');
      const cfItems = db.prepare(`SELECT category, color FROM clothes WHERE id IN (${placeholders})`).all(...cfItemIds);
      cfItems.forEach(it => {
        cfCategoryPrefer[it.category] = (cfCategoryPrefer[it.category] || 0) + 1;
        cfColorPrefer[it.color] = (cfColorPrefer[it.color] || 0) + 1;
      });
    }
  } catch(e) {}

  const userHistory = db.prepare(
    'SELECT items FROM outfits WHERE user_id = ? ORDER BY created_at DESC LIMIT 10'
  ).all(user_id);
  const frequentItemIds = {};
  userHistory.forEach(o => {
    try {
      JSON.parse(o.items).forEach(id => { frequentItemIds[id] = (frequentItemIds[id] || 0) + 1; });
    } catch(e) {}
  });

  let cfStyles = [];
  try {
    const similarOutfits = db.prepare(
      `SELECT style, COUNT(*) as cnt FROM outfits
       WHERE user_id != ? AND occasion = ?
       GROUP BY style ORDER BY cnt DESC LIMIT 5`
    ).all(user_id, occasion || '日常');
    cfStyles = similarOutfits.map(o => o.style);
  } catch(e) {}

  function itemScore(item) {
    let score = 0;
    score += seasonMatch(item.season) * 8;
    score += occasionMatch(item.occasion) * 10;
    score += weatherColorBonus(item.color);
    if (item.is_favorite) score += 3;
    score += Math.min(item.wear_count || 0, 8) * 0.5;
    if (frequentItemIds[item.id]) score += frequentItemIds[item.id] * 1.5;
    if (cfCategoryPrefer[item.category]) score += Math.min(cfCategoryPrefer[item.category], 5);
    if (cfColorPrefer[item.color]) score += Math.min(cfColorPrefer[item.color], 4);
    return score;
  }

  const filteredClothes = allClothes.filter(c => seasonMatch(c.season) > 0);

  if (filteredClothes.length < 2) return res.json({ code: 200, data: [], message: '该季节衣物不足' });

  const categories = { '上衣': [], '裤装': [], '裙装': [], '外套': [], '鞋子': [], '包包': [], '配饰': [] };
  filteredClothes.forEach(c => { if (categories[c.category]) categories[c.category].push(c); });

  const tops = categories['上衣'];
  const bottoms = [...categories['裤装'], ...categories['裙装']];
  const shoes = categories['鞋子'];
  const outers = categories['外套'];
  const bags = categories['包包'];

  if (!tops.length || !bottoms.length) return res.json({ code: 200, data: [], message: '上衣或下装不足，无法生成搭配' });

  const allCombos = [];
  for (const top of tops) {
    for (const bottom of bottoms) {
      let score = 0;
      score += itemScore(top) + itemScore(bottom);
      score += colorScore(top.color, bottom.color) * 8;

      if (top.occasion === occasion && bottom.occasion === occasion) score += 15;
      else if (top.occasion === occasion || bottom.occasion === occasion) score += 8;

      score += (Math.random() * 6 - 3);

      allCombos.push({ top, bottom, score });
    }
  }

  allCombos.sort((a, b) => b.score - a.score);

  const schemes = [];
  const usedTops = new Set();
  const usedBottoms = new Set();

  for (const combo of allCombos) {
    if (schemes.length >= 3) break;

    if (schemes.length > 0 && usedTops.has(combo.top.id) && usedBottoms.has(combo.bottom.id)) continue;
    if (schemes.length >= 2 && (usedTops.has(combo.top.id) || usedBottoms.has(combo.bottom.id))) continue;

    usedTops.add(combo.top.id);
    usedBottoms.add(combo.bottom.id);

    const idx = schemes.length;
    const shoe = shoes.length ? shoes.reduce((best, s) => {
      const sc = itemScore(s) + colorScore(combo.top.color, s.color) * 3 + (Math.random() * 2);
      return sc > best.sc ? { item: s, sc } : best;
    }, { item: shoes[0], sc: -1 }).item : null;

    const outer = outers.length && needOuter ? outers.reduce((best, o) => {
      const sc = itemScore(o) + colorScore(combo.top.color, o.color) * 3 + (Math.random() * 2);
      return sc > best.sc ? { item: o, sc } : best;
    }, { item: outers[0], sc: -1 }).item : null;

    const bag = bags.length ? bags[idx % bags.length] : null;
    const items = [combo.top, combo.bottom, shoe, outer, bag].filter(Boolean);

    const styles = occasionStyle[occasion] || occasionStyle['日常'];
    let style = styles[0];
    if (cfStyles.length && idx === 0) {
      style = cfStyles[0];
    } else if (idx < styles.length) {
      style = styles[idx];
    }

    const hasExactOccasion = items.some(it => it.occasion === occasion);
    const algorithm = idx < 2 ? '规则引擎+协同过滤' : '规则引擎';

    schemes.push({
      title: `${occasion || '日常'}穿搭方案 ${idx + 1}`,
      items: items.map(it => it.id),
      itemDetails: items,
      occasion: occasion || '日常',
      weather: weather || '晴天',
      season: season || '春季',
      style,
      matchScore: Math.round(combo.score),
      algorithm
    });
  }

  if (!schemes.length) {
    return res.json({ code: 200, data: [], message: '无法生成匹配的搭配方案' });
  }

  db.prepare('INSERT INTO logs (action, detail, operator) VALUES (?,?,?)').run(
    '智能搭配', `为用户生成${schemes.length}套${occasion || '日常'}搭配方案(${season || '春季'}/${weather || '晴天'})`, 'system'
  );

  res.json({ code: 200, data: schemes });
});

// ========== SHARES API ==========
app.get('/api/shares', (req, res) => {
  const { user_id, style, occasion, status } = req.query;
  let sql = `SELECT s.*, u.nickname, u.avatar FROM shares s LEFT JOIN users u ON s.user_id = u.id WHERE 1=1`;
  const params = [];
  if (user_id) { sql += ' AND s.user_id = ?'; params.push(user_id); }
  if (style) { sql += ' AND s.style_tags LIKE ?'; params.push(`%${style}%`); }
  if (occasion) { sql += ' AND s.occasion_tags LIKE ?'; params.push(`%${occasion}%`); }
  if (status) { sql += ' AND s.status = ?'; params.push(status); }
  else { sql += " AND s.visibility = 'public' AND s.status = 'approved'"; }
  sql += ' ORDER BY s.created_at DESC';
  const shares = db.prepare(sql).all(...params);
  res.json({ code: 200, data: shares });
});

app.get('/api/shares/:id', (req, res) => {
  const share = db.prepare('SELECT s.*, u.nickname, u.avatar FROM shares s LEFT JOIN users u ON s.user_id = u.id WHERE s.id = ?').get(req.params.id);
  if (!share) return res.json({ code: 404, message: '内容不存在' });
  const userId = req.query.user_id;
  if (share.status !== 'approved' && String(share.user_id) !== String(userId || '')) {
    return res.json({ code: 403, message: '内容审核中或未通过，暂不可查看' });
  }
  const comments = db.prepare('SELECT c.*, u.nickname, u.avatar FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.share_id = ? ORDER BY c.created_at ASC').all(req.params.id);
  let liked = false;
  let collected = false;
  if (userId) {
    liked = !!db.prepare('SELECT id FROM likes WHERE share_id = ? AND user_id = ?').get(req.params.id, userId);
    collected = !!db.prepare('SELECT id FROM collects WHERE share_id = ? AND user_id = ?').get(req.params.id, userId);
  }
  res.json({ code: 200, data: { ...share, comments, liked, collected } });
});

app.get('/api/users/:userId/collects', (req, res) => {
  const rows = db.prepare(`
    SELECT s.*, u.nickname, u.avatar, c.created_at AS collected_at
    FROM collects c
    JOIN shares s ON s.id = c.share_id
    LEFT JOIN users u ON s.user_id = u.id
    WHERE c.user_id = ?
    ORDER BY c.created_at DESC
    LIMIT 50
  `).all(req.params.userId);
  res.json({ code: 200, data: rows });
});

app.post('/api/shares', (req, res) => {
  const { user_id, outfit_id, content, images, style_tags, occasion_tags, visibility } = req.body;
  const vis = visibility || 'public';
  const status = vis === 'public' ? 'pending' : 'approved';
  const result = db.prepare('INSERT INTO shares (user_id, outfit_id, content, images, style_tags, occasion_tags, visibility, status) VALUES (?,?,?,?,?,?,?,?)').run(user_id, outfit_id || null, content, images, style_tags, occasion_tags, vis, status);
  const message = status === 'pending' ? '已提交审核，管理员通过后将展示在广场' : '发布成功';
  res.json({ code: 200, data: { id: result.lastInsertRowid, status }, message });
});

app.delete('/api/shares/:id', (req, res) => {
  db.prepare('DELETE FROM comments WHERE share_id = ?').run(req.params.id);
  db.prepare('DELETE FROM likes WHERE share_id = ?').run(req.params.id);
  db.prepare('DELETE FROM collects WHERE share_id = ?').run(req.params.id);
  db.prepare('DELETE FROM shares WHERE id = ?').run(req.params.id);
  res.json({ code: 200, message: '删除成功' });
});

app.post('/api/shares/:id/like', (req, res) => {
  const { user_id } = req.body;
  const share = db.prepare('SELECT status FROM shares WHERE id = ?').get(req.params.id);
  if (!share) return res.json({ code: 404, message: '内容不存在' });
  if (share.status !== 'approved') return res.json({ code: 403, message: '内容未通过审核，暂不可操作' });
  const exists = db.prepare('SELECT id FROM likes WHERE share_id = ? AND user_id = ?').get(req.params.id, user_id);
  if (exists) {
    db.prepare('DELETE FROM likes WHERE share_id = ? AND user_id = ?').run(req.params.id, user_id);
    db.prepare('UPDATE shares SET likes_count = MAX(0, likes_count - 1) WHERE id = ?').run(req.params.id);
    res.json({ code: 200, data: { liked: false } });
  } else {
    db.prepare('INSERT INTO likes (share_id, user_id) VALUES (?,?)').run(req.params.id, user_id);
    db.prepare('UPDATE shares SET likes_count = likes_count + 1 WHERE id = ?').run(req.params.id);
    res.json({ code: 200, data: { liked: true } });
  }
});

app.post('/api/shares/:id/collect', (req, res) => {
  const { user_id } = req.body;
  const share = db.prepare('SELECT status FROM shares WHERE id = ?').get(req.params.id);
  if (!share) return res.json({ code: 404, message: '内容不存在' });
  if (share.status !== 'approved') return res.json({ code: 403, message: '内容未通过审核，暂不可操作' });
  const exists = db.prepare('SELECT id FROM collects WHERE share_id = ? AND user_id = ?').get(req.params.id, user_id);
  if (exists) {
    db.prepare('DELETE FROM collects WHERE share_id = ? AND user_id = ?').run(req.params.id, user_id);
    db.prepare('UPDATE shares SET collects_count = MAX(0, collects_count - 1) WHERE id = ?').run(req.params.id);
    res.json({ code: 200, data: { collected: false } });
  } else {
    db.prepare('INSERT INTO collects (share_id, user_id) VALUES (?,?)').run(req.params.id, user_id);
    db.prepare('UPDATE shares SET collects_count = collects_count + 1 WHERE id = ?').run(req.params.id);
    res.json({ code: 200, data: { collected: true } });
  }
});

app.post('/api/shares/:id/comment', (req, res) => {
  const { user_id, content, parent_id } = req.body;
  const share = db.prepare('SELECT status FROM shares WHERE id = ?').get(req.params.id);
  if (!share) return res.json({ code: 404, message: '内容不存在' });
  if (share.status !== 'approved') return res.json({ code: 403, message: '内容未通过审核，暂不可操作' });
  db.prepare('INSERT INTO comments (share_id, user_id, content, parent_id) VALUES (?,?,?,?)').run(req.params.id, user_id, content, parent_id || 0);
  db.prepare('UPDATE shares SET comments_count = comments_count + 1 WHERE id = ?').run(req.params.id);
  res.json({ code: 200, message: '评论成功' });
});

// ========== STATS API ==========
app.get('/api/stats/clothes/:userId', (req, res) => {
  const byCategory = db.prepare('SELECT category, COUNT(*) as count FROM clothes WHERE user_id = ? GROUP BY category').all(req.params.userId);
  const bySeason = db.prepare('SELECT season, COUNT(*) as count FROM clothes WHERE user_id = ? GROUP BY season').all(req.params.userId);
  const byColor = db.prepare('SELECT color, COUNT(*) as count FROM clothes WHERE user_id = ? GROUP BY color ORDER BY count DESC LIMIT 8').all(req.params.userId);
  const mostWorn = db.prepare('SELECT * FROM clothes WHERE user_id = ? ORDER BY wear_count DESC LIMIT 5').all(req.params.userId);
  const leastWorn = db.prepare('SELECT * FROM clothes WHERE user_id = ? AND wear_count <= 2 ORDER BY wear_count ASC LIMIT 5').all(req.params.userId);
  const total = db.prepare('SELECT COUNT(*) as count FROM clothes WHERE user_id = ?').get(req.params.userId).count;
  const favoriteCount = db.prepare('SELECT COUNT(*) as count FROM clothes WHERE user_id = ? AND is_favorite = 1').get(req.params.userId).count;
  res.json({ code: 200, data: { byCategory, bySeason, byColor, mostWorn, leastWorn, total, favoriteCount } });
});

app.get('/api/stats/style/:userId', (req, res) => {
  const outfits = db.prepare('SELECT style, COUNT(*) as count FROM outfits WHERE user_id = ? GROUP BY style ORDER BY count DESC').all(req.params.userId);
  const occasions = db.prepare('SELECT occasion, COUNT(*) as count FROM outfits WHERE user_id = ? GROUP BY occasion ORDER BY count DESC').all(req.params.userId);
  const monthlyOutfits = db.prepare(`SELECT strftime('%Y-%m', created_at) as month, COUNT(*) as count FROM outfits WHERE user_id = ? GROUP BY month ORDER BY month DESC LIMIT 6`).all(req.params.userId);
  res.json({ code: 200, data: { outfits, occasions, monthlyOutfits } });
});

// ========== ADMIN API ==========
app.get('/api/admin/users', (req, res) => {
  const users = db.prepare("SELECT * FROM users WHERE role = 'user' ORDER BY created_at DESC").all();
  users.forEach(u => {
    u.clothesCount = db.prepare('SELECT COUNT(*) as c FROM clothes WHERE user_id = ?').get(u.id).c;
    u.sharesCount = db.prepare('SELECT COUNT(*) as c FROM shares WHERE user_id = ?').get(u.id).c;
  });
  res.json({ code: 200, data: users });
});

app.put('/api/admin/users/:id/status', (req, res) => {
  const { status } = req.body;
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
  if (!user) return res.json({ code: 404, message: '用户不存在' });
  db.prepare('UPDATE users SET status = ? WHERE id = ?').run(status, req.params.id);
  db.prepare('INSERT INTO logs (action, detail, operator) VALUES (?,?,?)').run(
    '用户管理', `${status === 'active' ? '启用' : '禁用'}用户 ${user.nickname}`, 'admin'
  );
  res.json({ code: 200, message: '操作成功' });
});

app.get('/api/admin/users/export', (req, res) => {
  const users = db.prepare("SELECT id, nickname, gender, phone, status, created_at FROM users WHERE role = 'user'").all();
  users.forEach(u => {
    u.clothesCount = db.prepare('SELECT COUNT(*) as c FROM clothes WHERE user_id = ?').get(u.id).c;
    u.outfitsCount = db.prepare('SELECT COUNT(*) as c FROM outfits WHERE user_id = ?').get(u.id).c;
    u.sharesCount = db.prepare('SELECT COUNT(*) as c FROM shares WHERE user_id = ?').get(u.id).c;
  });
  res.json({ code: 200, data: users });
});

app.get('/api/admin/stats', (req, res) => {
  const totalUsers = db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'user'").get().c;
  const totalClothes = db.prepare('SELECT COUNT(*) as c FROM clothes').get().c;
  const totalShares = db.prepare('SELECT COUNT(*) as c FROM shares').get().c;
  const totalOutfits = db.prepare('SELECT COUNT(*) as c FROM outfits').get().c;
  const pendingReviews = db.prepare("SELECT COUNT(*) as c FROM shares WHERE status = 'pending'").get().c;
  const pendingFeedbacks = db.prepare("SELECT COUNT(*) as c FROM feedbacks WHERE status = 'pending'").get().c;
  const recentUsers = db.prepare("SELECT * FROM users WHERE role = 'user' ORDER BY created_at DESC LIMIT 5").all();
  res.json({ code: 200, data: { totalUsers, totalClothes, totalShares, totalOutfits, pendingReviews, pendingFeedbacks, recentUsers } });
});

app.get('/api/admin/reviews', (req, res) => {
  const { status } = req.query;
  let sql = 'SELECT s.*, u.nickname, u.avatar FROM shares s LEFT JOIN users u ON s.user_id = u.id';
  const params = [];
  if (status) { sql += ' WHERE s.status = ?'; params.push(status); }
  sql += ' ORDER BY s.created_at DESC';
  res.json({ code: 200, data: db.prepare(sql).all(...params) });
});

app.put('/api/admin/reviews/:id', (req, res) => {
  const { status } = req.body;
  db.prepare('UPDATE shares SET status = ? WHERE id = ?').run(status, req.params.id);
  db.prepare('INSERT INTO logs (action, detail, operator) VALUES (?,?,?)').run('内容审核', `穿搭 #${req.params.id} 状态更新为 ${status}`, 'admin');
  res.json({ code: 200, message: '操作成功' });
});

app.post('/api/admin/reviews/batch-delete', (req, res) => {
  const { ids } = req.body;
  if (!ids || !ids.length) return res.json({ code: 400, message: '缺少ID列表' });
  const del = db.prepare('DELETE FROM shares WHERE id = ?');
  const delComments = db.prepare('DELETE FROM comments WHERE share_id = ?');
  const delLikes = db.prepare('DELETE FROM likes WHERE share_id = ?');
  const delCollects = db.prepare('DELETE FROM collects WHERE share_id = ?');
  const transaction = db.transaction((shareIds) => {
    for (const id of shareIds) {
      delComments.run(id);
      delLikes.run(id);
      delCollects.run(id);
      del.run(id);
    }
  });
  transaction(ids);
  db.prepare('INSERT INTO logs (action, detail, operator) VALUES (?,?,?)').run('批量删除', `批量删除 ${ids.length} 条违规穿搭`, 'admin');
  res.json({ code: 200, message: `已删除 ${ids.length} 条内容` });
});

app.get('/api/admin/announcements', (req, res) => {
  res.json({ code: 200, data: db.prepare('SELECT * FROM announcements ORDER BY created_at DESC').all() });
});

app.post('/api/admin/announcements', (req, res) => {
  const { title, content } = req.body;
  db.prepare('INSERT INTO announcements (title, content) VALUES (?,?)').run(title, content);
  res.json({ code: 200, message: '发布成功' });
});

app.delete('/api/admin/announcements/:id', (req, res) => {
  db.prepare('DELETE FROM announcements WHERE id = ?').run(req.params.id);
  res.json({ code: 200, message: '删除成功' });
});

app.get('/api/admin/feedbacks', (req, res) => {
  const feedbacks = db.prepare('SELECT f.*, u.nickname, u.avatar FROM feedbacks f LEFT JOIN users u ON f.user_id = u.id ORDER BY f.created_at DESC').all();
  res.json({ code: 200, data: feedbacks });
});

app.put('/api/admin/feedbacks/:id', (req, res) => {
  const { reply, status } = req.body;
  db.prepare('UPDATE feedbacks SET reply = ?, status = ? WHERE id = ?').run(reply, status || 'replied', req.params.id);
  res.json({ code: 200, message: '回复成功' });
});

app.get('/api/admin/logs', (req, res) => {
  res.json({ code: 200, data: db.prepare('SELECT * FROM logs ORDER BY created_at DESC LIMIT 50').all() });
});

app.post('/api/feedbacks', (req, res) => {
  const { user_id, type, content } = req.body;
  if (!content) return res.json({ code: 400, message: '内容不能为空' });
  db.prepare('INSERT INTO feedbacks (user_id, type, content) VALUES (?,?,?)').run(user_id, type || 'suggestion', content);
  db.prepare('INSERT INTO logs (action, detail, operator) VALUES (?,?,?)').run('用户反馈', `用户提交了${type === 'complaint' ? '投诉' : '建议'}`, 'user');
  res.json({ code: 200, message: '提交成功' });
});

app.get('/api/announcements/active', (req, res) => {
  res.json({ code: 200, data: db.prepare('SELECT * FROM announcements WHERE is_active = 1 ORDER BY created_at DESC').all() });
});

const server = app.listen(PORT, () => {
  console.log(`Fashion Closet API running at http://localhost:${PORT}`);
});
server.on('error', (err) => {
  console.error('Server error:', err);
});
