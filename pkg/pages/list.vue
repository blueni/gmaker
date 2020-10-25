<template>
    <div class="list-page">
        <div class="page-content">
            <div class="blog-overview">
                <a href="javascript:;" class="blog-item" v-for="(doc, index) in blogList" :key="index" @click="gotoBlog(doc)">
                    <span class="blog-title">{{ doc.title }}</span>
                    <span class="blog-time">{{ doc.stats.mtimeMs | time }}</span>

                    <div class="label-list" v-if="doc.labels">
                        <span class="blog-label" v-for="(label, index) in doc.labels" :key="index">
                            {{ label }}
                        </span>
                    </div>

                    <div class="md-info" :id="`md-info-${doc.id}`"></div>
                </a>
            </div>
            <div class="load-more">
                <g-loading-1 animate="scale" width="5px" height="20px" class="load-more" v-if="loadingMore"></g-loading-1>
                <div class="no-more" v-if="noMore">就这么多了</div>
            </div>
        </div>        
    </div>
</template>

<script>
import { mapState } from 'vuex'
import gLoading1 from '../components/loading1.vue'

let scrollHandlers = []
let timer
let $win = $(window)
function onScroll(elem) {
    clearTimeout(timer)

    timer = setTimeout(() => {
        let htmlElem = document.documentElement
        let scrollTop = htmlElem.scrollTop || document.body.scrollTop
        let scrollHeight = htmlElem.scrollHeight
        let winHeight = $win.height()

        if (scrollHeight - scrollTop - winHeight <= 40) {
            scrollHandlers.forEach((handler) => {
                handler()
            })
        }
    }, 400)
}

export default {
    name: 'list',

    components: {
        gLoading1,
    },

    computed: {
        ...mapState(['categories', 'currentCategory']),
    },

    data() {
        return {
            blogList: [],
            page: 0,
            loadingMore: false,
            noMore: false,
        }        
    },

    filters: {
        time(value) {
            let date = new Date(+value)
            return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日
                    ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`
        },
    },

    watch: {
        currentCategory() {
            this.noMore = false
            this.page = 0
            this.blogList = []
            this.getBlogList()
        },
    },

    async created() {
        this.getBlogList()
    },

    mounted() {
        scrollHandlers.push(this.loadMore)
        $win.on('scroll', onScroll)
    },

    destroyed() {
        scrollHandlers = []
        $win.off('scroll', onScroll)
    },

    methods: {
        async getBlogList(query = {}) {
            let params = {
                page: this.page,
                category: this.currentCategory,
            }
            params = Object.assign(params, query)

            let list = await this.$sdk.getBlogList(params)
            if (!list || !list.length) {
                this.noMore = true
                return
            }

            let blogList = this.blogList || []
            let map = {}
            let ret = []
            blogList.forEach(blog => {
                map[blog.id] = blog
                blog.index = ret.length
                ret.push(blog)
            })
            list.forEach(blog => {
                let id = blog.id
                let originBlog = map[id]
                if (originBlog) {
                    ret[originBlog.index] = blog
                    blog.index = originBlog.index
                } else {
                    ret.push(blog)
                }
            })

            this.blogList = ret
            this.$nextTick(this.renderMd)
        },
        
        renderMd() {
            this.blogList.forEach(blog => {
                let elemId = `md-info-${blog.id}`
                let elem = $(`#${elemId}`)
                elem.html('')
                editormd.markdownToHTML(elemId, {
                    markdown: blog.overview,
                    previewCodeHighlight: false,
                })
            })
        },

        gotoBlog(blog) {
            this.$store.commit('blog', blog)
            this.$router.push(`/detail/${blog.id}`)
        },

        async loadMore() {
            if (this.noMore) {
                return
            }

            this.loadingMore = true
            this.page++
            await this.getBlogList()
            this.loadingMore = false
        },
    },
}
</script>

<style lang="less">
.list-page{
    .blog-overview{
        padding-top: 10px;

        .blog-item {
            display: block;
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 10px;
            background: #e0e0e0;

            &:hover{
                box-shadow: 1px 1px 5px rgba(0, 0, 0, .6);
            }
        }
    }

    .blog-title{
        color: #333333;
        text-decoration: none;
    }

    .blog-time{
        font-size: 12px;
        color: #333333;
        float: right;
    }

    .blog-label{
        display: inline-block;
        color: #ffffff;
        font-size: 12px;
        border-radius: 2px;
        margin: 0 5px;
        padding: 0 5px;
        background: #222222;
    }
    
    .label-list{
        margin-bottom: 6px;
    }

    .load-more{
        margin-bottom: 20px;
    }

    .no-more{
        display: flex;
        justify-content: center;
        font-size: 12px;
        color: #666666;

        &:before, &:after{
            content: '----';
            margin: 0 5px;
        }
    }
}

</style>
