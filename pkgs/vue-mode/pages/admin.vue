<template>
    <div class="doc-admin">
        <a href="javascript:;" class="menu-collapse" @click="collapse = !collapse">☰</a>
        <div class="doc-list-box" :class="{ collapse }">
            <div class="tool-box">
                <button class="doc-button" @click="newBlog">新增博客</button>
            </div>
            <div class="menu-box" v-if="menu">
                <ul 
                    class="doc-list"
                    v-for="category in categories"
                    :key="category"
                    :class="{ active: menu[category].open}"
                >
                    <li class="category-item" @click="menu[category].open = !menu[category].open">{{ category }}</li>
                    <li class="sub-list" v-if="menu[category]">
                        <ul class="list">
                            <li 
                                class="doc-item"
                                v-for="doc in menu[category].list"
                                :key="doc.id"
                                :class="{active: blog && blog.name === doc.name}"
                                @click="getDetail(doc)"
                            >
                                {{ doc.title }}
                                <button class="doc-button delete" @click.stop="deleteBlog(doc)">&times;</button>
                            </li>
                        </ul>
                    </li>
                </ul>
            </div>
        </div>

        <div class="form-content">
            <div class="md-detail" v-show="showDetail">
                <div class="form-item">
                    <span class="form-label">标题：</span>
                    <input type="text" v-model="blog.title" />
                </div>

                <div class="form-item">
                    <span class="form-label">分类：</span>
                    <label v-for="category in categories" :key="category">
                        <input type="radio" name="category" :value="category" v-model="blog.category" /> {{ category }}
                    </label>
                    <button class="doc-button" @click="newCategory">新增分类</button>
                </div>

                <div class="form-item">
                    <span class="form-label">标签：</span>
                    <label v-for="(label, index) in labels" :key="index">
                        <input type="checkbox" name="label" v-model="checkedLabels[label]" /> {{ label }}
                    </label>
                    <button class="doc-button" @click="newLabel">新增标签</button>
                </div>

                <div class="edit-doc" id="md-editor">
                    <textarea style="display: none" :value="detail"></textarea>
                </div>

                <div class="form-item">
                    <button class="doc-button" @click="submit">保 存</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'

const blogTemplate = {
    id: '',
    name: '',
    title: '',
    category: '',
    labels: [],
}
let editor = null

export default {
    name: 'admin',

    data() {
        return {
            menu: null,
            blogList: [],
            labels: [],
            checkedLabels: {},
            blog: Object.assign({}, blogTemplate),
            oldCategory: '',
            detail: '',
            showDetail: false,
            collapse: false,
        }        
    },

    computed: {
        ...mapState(['categories', 'currentCategory']),
    },

    watch: {
        collapse() {
            if (editor) {
                // 展开与收起左侧菜单有动画时间，动画结束后再重绘editor
                setTimeout(() => {
                    editor.resize()
                }, 400)
            }
        }
    },

    async created() {
        this.getLabels()
        await this.getCategories()
        this.getBlogList()
    },

    destroyed() {
        $('#md-editor').html('')
        editor = null
    },

    methods: {
        // 不传withOldMenu参数时会创建一个不包含文章列表的空菜单，此处是为了重新加载文章列表
        // 当传递withOldMenu参数时，会在旧菜单上更新，此处用在新增分类后会加一个菜单项
        getMenu(categories = [], withOldMenu) {
            let menu = Object.assign({}, this.menu)
            categories.forEach((category, index) => {
                let oldSubMenu = menu[category] || {}
                let subMenu = {
                    list: [],
                    // 菜单展开与收起状态一直与旧菜单保持一致
                    open: oldSubMenu.open || index === 0,
                }
                if (withOldMenu) {
                    subMenu = Object.assign(subMenu, oldSubMenu)
                }
                menu[category] = subMenu
            })
            return menu
        },

        updateMenu(categories) {
            let menu = this.getMenu(categories, true)
            this.menu = menu
        },

        async getBlogList(query = {}) {
            query.pageSize = 1000000
            let list = await this.$sdk.getBlogList(query)
            
            let categories = this.categories
            let menu = this.getMenu(categories)
            list.forEach(blog => {
                menu[blog.category].list.push(blog)
            })
            this.menu = menu
        },

        async getCategories() {
            let categories = await this.$sdk.getCategories()
            this.$store.commit('categories', categories)
        },

        async getLabels() {
            let res = await this.$sdk.getLabels()
            this.labels = res

            let checkedLabels = {}
            this.labels.forEach(item => {
                checkedLabels[item] = false
            })
            this.checkedLabels = checkedLabels
        },

        async getDetail(doc) {
            this.setCheckedLabels(doc.labels)
            this.blog = Object.assign({}, doc)
            this.oldCategory = doc.category
            let md = await this.$sdk.getDetail(doc)
            this.detail = md
            this.$nextTick(() => {
                this.renderMarkdown()
            })
        },

        setCheckedLabels(list = []) {
            let checkedLabels = {}
            let labels = this.labels
            labels.forEach(item => {
                checkedLabels[item] = list.indexOf(item) >= 0
            })
            this.checkedLabels = checkedLabels
        },

        renderMarkdown() {
            this.showDetail = true
            if (!editor) {
                editor = editormd({
                    id: 'md-editor',
                    width: '100%',
                    height: '73%',
                    syncScrolling : 'single',
                    path: '/public/editor.md/lib/',
                })
            } else {
                editor.setMarkdown(this.detail)
            }
        },

        newBlog() {
            this.oldCategory = ''
            this.blog = Object.assign({}, blogTemplate)
            this.labels.forEach(label => {
                this.checkedLabels[label] = false
            })
            this.detail = ''
            this.renderMarkdown()
        },

        async newCategory() {
            let categories = this.categories.slice()
            let category = prompt('请输入分类名：')

            if (!category || categories.indexOf(category) >= 0) {
                return
            }

            await this.$post('/category/submit', { category })
            categories.push(category)
            this.updateMenu(categories)
            this.$store.commit('categories', categories)
        },

        async newLabel() {
            let labels = this.labels
            let label = prompt('请输入标签名：')

            if (!label || labels.indexOf(label) >= 0) {
                return
            }

            await this.$post('/label/submit', { label })
            this.getLabels()
        },

        async deleteBlog(blog) {
            let bool = confirm('确定删除这条博客吗？')
            if (!bool) {
                return
            }

            await this.$post('/blog/delete', blog)
            this.getBlogList()

            if (this.blog.id === blog.id) {
                this.showDetail = false
            }
        },

        async submit() {
            let checkedLabels = this.checkedLabels
            let blog = Object.assign({}, this.blog)

            if (!blog.category) {
                alert('请选择文章分类')
                return
            }

            let labels = []
            for (let label in checkedLabels) {
                if (checkedLabels[label]) {
                    labels.push(label)
                }
            }
            if (this.oldCategory !== blog.category) {
                blog.oldCategory = this.oldCategory
            }
            blog.labels = labels
            blog.content = editor.getMarkdown()
            await this.$post('/blog/submit', blog)
            this.getBlogList()
            alert((blog.id ? '修改' : '新增') + '博客成功!')

            if (!blog.id) {
                this.newBlog()
            } else {
                this.oldCategory = blog.category
                this.blog = blog
            }
        },
    },
}
</script>

<style lang="less">
.doc-admin{
    display: flex;
    padding-top: 60px;
    background: #eaeaea;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;

    .menu-collapse{
        width: 36px;
        height: 36px;
        color: #ffffff;
        text-align: center;
        line-height: 36px;
        background: rgba(0, 0, 0, .3);
        border: 1px solid #666666;
        position: fixed;
        left: 5px;
        top: 62px;
        z-index: 4;

        &:hover{
            background: #222222;
        }
    }

    .doc-button{
        min-width: 60px;
        line-height: 1em;
        color: #ffffff;
        background: #222222;
        outline: none;
        border-radius: 2px;
        padding: 8px 10px;
        box-shadow: 0 0 2px #eaeaea;
        cursor: pointer;

        &:hover{
            background: #111111;
        }

        &.delete{
            min-width: auto;
            width: 20px;
            height: 20px;
            line-height: 0;
            font-size: 24px;
            color: #de2336;
            border: none;
            padding: 4px;
            background: transparent;
            box-shadow: none;

            &:hover{
                background: transparent;
                color: #aa2336;
            }
        }
    }

    .doc-list-box{
        width: 420px;
        max-width: 100%;
        height: 100%;
        border-top: 1px solid #eaeaea;
        border-right: 1px solid #dadada;
        background: #333333;
        flex-shrink: 0;
        opacity: 1;
        transition: all 200ms ease-in-out;

        &.collapse {
            width: 0;
            opacity: 0;
        }

        .tool-box{
            text-align: right;
            border-bottom: 10px solid #222222;
            padding: 5px;
        }

        .category-item{
            height: 40px;
            line-height: 40px;
            color: #ffffff;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 10px;
            border-bottom: 1px solid #444444;
            background: #555555;
            cursor: pointer;

            &:after{
                content: '>';
                font-size: 16px;
                transition: transform .3s;
            }

            &:hover{
                background: #666666;
                box-shadow: 0 0 4px 0 rgba(0, 0, 0, .8);
            }
        }

        .doc-list{
            list-style: none;

            &.active{
                .category-item{
                    background: #666666;
                    box-shadow: 0 0 4px 0 rgba(0, 0, 0, .8);
                    &:after{
                        transform: rotate(90deg);
                    }
                }
                .sub-list{
                    height: auto;
                    overflow: auto;
                    opacity: 1;
                    transform: translateX(0);
                }
            }
        }

        .sub-list{
            height: 0;
            max-height: 240px;
            overflow: hidden;
            transform: translateX(-100px);
            opacity: 0;
            transition: all .3s;
        }

        .delete{
            float: right;
            margin-top: 10px;
        }

        .doc-item{
            color: #ffffff;
            line-height: 40px;
            border-bottom: 1px solid #404040;
            padding: 0 10px 0 20px;
            text-overflow: ellipsis;
            cursor: pointer;

            &:hover,&.active{
                background: #444444;
            }
        }
    }

    .form-content{
        display: flex;
        width: 100%;
        padding: 10px;
    }

    .md-detail{
        width: 100%;
        overflow: auto;
    }

    .form-item{
        margin-bottom: 20px;
        line-height: 30px;

        input[type="text"]{
            width: 220px;
            height: 30px;
            line-height: 30px;
            vertical-align: middle;
            padding: 0 0 0 10px;
        }

        .form-label{
            margin-right: 20px;
            vertical-align: middle;
        }

        label{
            margin-right: 20px;
        }
    }

    .edit-doc{
        background: #efefef;
        z-index: 5;
    }
}
</style>
