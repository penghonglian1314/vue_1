import Vue from 'vue'
import VueRouter from 'vue-router'
import '../assets/css/global.css'
import '../assets/fonts/iconfont.css'
import Login from '../componets/Login.vue'
import Home from '../componets/Home.vue'
import Welcome from '../componets/Welcome.vue'
import Users from '../componets/user/Users.vue'
import Roles from '../componets/rights/Roles.vue'
import Rights from '../componets/rights/Rights.vue'
import Goods from '../componets/goods/Goods.vue'
import List from '../componets/goods/List.vue'
import Add from '../componets/goods/Add.vue'
import Params from '../componets/goods/Params.vue'
import Order from '../componets/order/Order.vue'
import Report from '../componets/report/Report.vue'
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
      { path: '/users', component: Users },
      { path: '/roles', component: Roles },
      { path: '/rights', component: Rights },
      { path: '/categories', component: Goods },
      { path: '/params', component: Params },
      { path: '/goods/add', component: Add },
      { path: '/goods', component: List },
      { path: '/order', component: Order },
      { path: '/reports', component: Report }
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
