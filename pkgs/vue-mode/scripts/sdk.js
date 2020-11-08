import axios from 'axios'
import store from './store'

const baseURL = location.pathname
const http = axios.create({ baseURL })
// 默认每页10条
const PAGE_SIZE = 10
// 每一个列表文件存储了200条博客记录
const LIST_SIZE = 200
// 名为"删除"的分类，存在下划线分类下的文章是已经被删除了的
const CATEGORY_DELETED = '_'

http.interceptors.response.use(res => {
    store.commit('loading', false)
    return res
}, error => {
    store.commit('error', error)
    store.commit('loading', false)
})

async function request(url = '', method = 'GET', params = {}) {
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

    store.commit('loading', true)
    let res = await http(options).then(res => res.data)
    return res
}

const get = (url, params) => request(url, 'GET', params)
const post = (url, params) => request(url, 'POST', params)

async function getBlogList(query = {}) {
    let { category, page } = query
    let quickIndex = await get('/data/quick_index.json')
    let ids = []
    let pageSize = query.pageSize || PAGE_SIZE

    if (category) {
        ids = quickIndex[category] || []
    } else {
        for (let key in quickIndex) {
            if (key === CATEGORY_DELETED) {
                // 这里面记录的文章是已经被删除了的
                continue
            }
            ids = ids.concat(quickIndex[key])
        }
    }

    if (isNaN(page)) {
        page = 0
    }

    let index = pageSize * page    
    ids = ids.slice(index, index + pageSize)
    let sortedIds = ids.slice().sort()

    let openedList = -1
    let shouldOpenList = []
    sortedIds.forEach(id => {
        let shouldOpen = Math.floor(id / LIST_SIZE)
        if (shouldOpenList > openedList) {
            shouldOpenList.push(shouldOpen)
            openedList = shouldOpen
        }
    })

    let res = await Promise.all(shouldOpenList.map(num => {
        return get(`/data/summary/list${num}.json`)
    }))
    let blogs = []
    res.forEach(list => {
        list.forEach(blog => {
            let index = ids.indexOf(blog.id)
            if (index >= 0) {
                blogs[index] = blog
            }
        })
    })

    return blogs
}

async function getCategories() {
    let categories = store.state.categories
    if (!categories.length) {
        let quickIndex = await get('/data/quick_index.json')
        // 所有分类(CATEGORY_DELETED分类代表这些博客已经被删除)
        categories = Object.keys(quickIndex).filter(key => key !== CATEGORY_DELETED)
    }
    return categories
}

function getLabels() {
    return get('/data/labels.json')
}

async function getDocDescription(id) {
    let num = Math.floor(id / LIST_SIZE)
    let list = await get(`/data/summary/list${num}.json`)
    return list[id % LIST_SIZE]
}

function getDetail(doc) {
    let { id } = doc
    let filePath = `/docs/p${Math.floor(id / PAGE_SIZE)}/blog${id}.md`
    return get(filePath)
}

export default {
    PAGE_SIZE,
    LIST_SIZE,
    request,
    get,
    post,
    getBlogList,
    getCategories,
    getLabels,
    getDocDescription,
    getDetail,
}