import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'Home', component: () => import('../views/Home.vue') },
  { path: '/wardrobe', name: 'Wardrobe', component: () => import('../views/Wardrobe.vue') },
  { path: '/match', name: 'SmartMatch', component: () => import('../views/SmartMatch.vue') },
  { path: '/share', name: 'Share', component: () => import('../views/Share.vue') },
  { path: '/share/:id', name: 'ShareDetail', component: () => import('../views/ShareDetail.vue') },
  { path: '/stats', name: 'Stats', component: () => import('../views/Stats.vue') },
  { path: '/profile', name: 'Profile', component: () => import('../views/Profile.vue') },
  { path: '/login', name: 'Login', component: () => import('../views/Login.vue') },
  { path: '/admin', name: 'AdminDashboard', component: () => import('../views/admin/Dashboard.vue') },
  { path: '/admin/users', name: 'AdminUsers', component: () => import('../views/admin/Users.vue') },
  { path: '/admin/reviews', name: 'AdminReviews', component: () => import('../views/admin/Reviews.vue') },
  { path: '/admin/system', name: 'AdminSystem', component: () => import('../views/admin/System.vue') },
]

export default createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() { return { top: 0 } }
})
