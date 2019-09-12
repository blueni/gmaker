<template>
    <div class="doc-admin">
        <div class="doc-list-box">
            <router-link class="back-to-index" to="/">返回博客</router-link>
            <button class="doc-button" @click="newBlog">新增博客</button>
            <ul class="doc-list" v-if="summary && summary.docs">
                <li 
                    class="doc-item"
                    :class="{active: blog && blog.name === doc.name}"
                    v-for="(doc, index) in summary.docs"
                    :key="index" @click="getDetail(doc)"
                >
                    {{ doc.title }}
                    <button class="doc-button delete" @click.stop="deleteBlog(doc)">&times;</button>
                </li>
            </ul>
        </div>

        <div class="form-content" v-show="showDetail">
            <div class="form-item">
                <span class="form-label">标题：</span>
                <input type="text" v-model="blog.title" />
            </div>

            <div class="form-item">
                <span class="form-label">标签：</span>
                <label v-for="(label, index) in labels" :key="index">
                    <input type="checkbox" name="label" v-model="checkedLabels[label]" /> {{ label }}
                </label>
                <button class="doc-button" @click="newLabel">新增标签</button>
            </div>

            <div class="edit-doc" id="md-editor">
                <textarea style="display: none" :value="detail">{{ detail }}</textarea>
            </div>

            <div class="form-item">
                <button class="doc-button" @click="submit">保 存</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'admin',

    data() {
        return {
            summary: null,
            labels: [],
            checkedLabels: {},
            blog: {
                name: '',
                title: '',
                labels: [],
            },
            detail: '',
            editor: null,
            showDetail: false,
        }        
    },

    created() {
        this.getSummary()
        this.getLabels()
    },

    methods: {
        async getSummary() {
            let summary = await this.$get('/data/summary.json')
            this.summary = summary
        },

        async getLabels() {
            let res = await this.$get('/data/labels.json')
            this.labels = res.labels

            let checkedLabels = {}
            this.labels.forEach(item => {
                checkedLabels[item] = false
            })
            this.checkedLabels = checkedLabels
        },

        async getDetail(doc) {
            this.setCheckedLabels(doc.labels)
            this.blog = doc
            let md = await this.$get(`/docs/${doc.name}`)
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
            let editor = this.editor
            if (!editor) {
                this.editor = editormd({
                    id: 'md-editor',
                    width: '100%',
                    height: 640,
                    syncScrolling : 'single',
                    path: '/public/editor.md/lib/',
                })
            } else {
                editor.setMarkdown(this.detail)
            }
        },

        newBlog() {
            this.blog = {
                name: '',
                title: '',
                labels: [],
            }
            this.labels.forEach(label => {
                this.checkedLabels[label] = false
            })
            this.detail = ''
            this.renderMarkdown()
        },

        async newLabel() {
            let labels = this.labels
            let label = prompt('请输入标签名：')

            if (labels.indexOf(label) >= 0) {
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
            this.getSummary()

            if (this.blog.name === blog.name) {
                this.showDetail = false
            }
        },

        async submit() {
            let checkedLabels = this.checkedLabels
            let blog = Object.assign({}, this.blog)
            let labels = []
            for (let label in checkedLabels) {
                if (checkedLabels[label]) {
                    labels.push(label)
                }
            }
            blog.labels = labels
            blog.content = this.editor.getMarkdown()
            await this.$post('/blog/submit', blog)
            this.getSummary()
            alert((blog.name ? '修改' : '新增') + '博客成功!')

            if (!blog.name) {
                this.newBlog()
            }
        },
    },
}
</script>

<style lang="less">
.doc-admin{
    .doc-button{
        min-width: 60px;
        line-height: 1em;
        color: #ffffff;
        background: #23de36;
        outline: none;
        border: none;
        border-radius: 2px;
        padding: 8px 10px;
        cursor: pointer;

        &:hover{
            background: #23aa36;
        }

        &.delete{
            min-width: auto;
            width: 20px;
            height: 20px;
            line-height: 0;
            font-size: 24px;
            color: #de2336;
            padding: 4px;
            background: transparent;

            &:hover{
                background: transparent;
                color: #aa2336;
            }
        }
    }

    .doc-list-box{
        width: 180px;
        border-right: 1px solid #dadada;
        padding: 0 10px;
        box-sizing: border-box;
        float: left;

        .delete{
            float: right;
            margin-top: 5px;
        }

        .back-to-index{
            margin-right: 10px;
            color: #2332a0;
            text-decoration: none;

            &:hover{
                text-decoration: underline;
            }
        }

        .doc-list{
            list-style: none;
            margin: 10px 0 0;
            padding: 0;
        }

        li{
            line-height: 30px;
            border-bottom: 1px solid #dadada;
            margin-left: 0;
            padding-left: 0;
            cursor: pointer;

            &:hover,&.active{
                color: #2335da;
            }
        }
    }

    .form-content{
        margin-left: 200px;
        padding-top: 20px;
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
    }
}
</style>
