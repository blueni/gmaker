import Vue from 'vue'
import Router from 'vue-router'
import Vuex from 'vuex'
import axios from 'axios'
import marked from 'marked'

// vue pages...
import Index from '../pages/index.vue'
import Detail from '../pages/detail.vue'
import Admin from '../pages/admin.vue'

Vue.use(Router)
const router = new Router({
    routes: [
        {
            path: '/',
            name: 'index',
            component: Index,
        },
        {
            path: '/detail/:name',
            name: 'detail',
            component: Detail,
        },
        {
            path: '/admin',
            name: 'admin',
            component: Admin,
        },
    ]
})

Vue.use(Vuex)
const store = new Vuex.Store({
    state: {
        blog: null,
    },
    mutations: {
        blog(state, blog) {
            state.blog = blog
        },
    },
})

const baseURL = location.pathname
const http = axios.create({ baseURL })

function request(url = '', method = 'GET', params = {}) {
    let isGet = method === 'GET'
    if (isGet) {
        let arr = []
        Object.keys(params).forEach(key => {
            arr.push(key + '=' + encodeURIComponent(params[key]))
        })
        params = arr.join('&')
    }

    let options = {
        method,
        url,
    }

    if (isGet) {
        options.params = params
    } else {
        options.data = params
    }

    return http(options).then(res => res.data)
}

Vue.prototype.$get = (url, params) => request(url, 'GET', params)
Vue.prototype.$post = (url, params) => request(url, 'POST', params)

window.marked = Vue.marked = Vue.prototype.$marked = marked
Vue.editormd = Vue.prototype.$editormd = window.editormd

const app = new Vue({
    el: '#docs-app',
    render: (h) => h('router-view'),
    router,
    store,
})
