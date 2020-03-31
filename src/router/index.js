import Vue from 'vue'
import VueRouter from 'vue-router'
import '../assets/css/global.css'
import '../assets/fonts/iconfont.css'
import Login from '../componets/Login.vue'
import Home from '../componets/Home.vue'
import Welcome from '../componets/Welcome.vue'
import Users from '../componets/user/Users.vue'
// 通过this 来访问http
Vue.use(VueRouter)
const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login },
  {
    path: '/home',
    component: Home,
    redirect: '/welcome',
    children: [{ path: '/welcome', component: Welcome },
      { path: '/users', component: Users }
    ]
  }
]
const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})
// 挂载路由导航守卫
router.beforeEach((to, from, next) => {
  // to将要访问的路径，
  // from代表从哪个路径跳转而来
  // next表示放行
  if (to.path === '/login') return next()
  // 获取token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})
export default router
