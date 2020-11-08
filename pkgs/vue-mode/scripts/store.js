import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const state = {
    blog: null,
    categories: [],
    currentCategory: '',
    loading: false,
    error: '',
}

function makeMutations() {
    let mutatations = {}
    for (let key in state) {
        mutatations[key] = (state, prop) => {
            state[key] = prop
        }
    }
    return mutatations
}

const store = new Vuex.Store({
    state,
    mutations: makeMutations(),
})

export default store