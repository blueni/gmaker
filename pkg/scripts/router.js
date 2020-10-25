import Vue from 'vue'
import Router from 'vue-router'

// vue pages...
import Index from '../pages/index.vue'
import Detail from '../pages/detail.vue'
import List from '../pages/list.vue'
import Admin from '../pages/admin.vue'

Vue.use(Router)
export default new Router({
    routes: [
        {
            path: '/',
            name: 'index',
            component: Index,
            redirect: '/list',
            children: [
                {
                    path: '/list',
                    name: 'list',
                    component: List,
                },
                {
                    path: '/detail/:id',
                    name: 'detail',
                    component: Detail,
                },
            ]
        },
        {
            path: '/admin',
            name: 'admin',
            component: Admin,
        },
    ]
})