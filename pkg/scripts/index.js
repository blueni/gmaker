import Vue from 'vue'
import marked from 'marked'
import sdk from './sdk'
import store from './store'
import router from './router'

import App from '../pages/app.vue'

Vue.prototype.$sdk = sdk
Vue.prototype.$get = sdk.get
Vue.prototype.$post = sdk.post

window.marked = Vue.marked = Vue.prototype.$marked = marked
Vue.editormd = Vue.prototype.$editormd = window.editormd

const app = new Vue({
    el: '#docs-app',
    render: (h) => h(App),
    router,
    store,
})
