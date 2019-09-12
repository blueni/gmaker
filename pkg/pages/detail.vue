<template>
    <div class="detail-page" v-if="blog">
        <router-link class="back-to-index" to="/">首页</router-link>
        <h4 class="blog-title">
            {{ blog.title }}
            <small>{{ blog.mtimeMs | time }}</small>
        </h4>
        <div class="doc-content" id="md-viewer" v-show="detail">
            <textarea style="display: none" :value="detail">{{ detail }}</textarea>
            <!-- <div v-html="html"></div> -->
        </div>
    </div>
</template>

<script>
export default {
    name: 'detail',

    data() {
        return {
            detail: '',
        }
    },

    computed: {
        blog() {
            return this.$store.state.blog
        },
    },

    filters: {
        time(value) {
            let date = new Date(+value)
            return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日
                    ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`
        },
    },

    created() {
        if (!this.blog) {
            this.$router.replace('/')
            return
        }
        let docName = this.$route.params.name
        this.getDetail(docName)
    },

    methods: {
        async getDetail(docName) {
            let md = await this.$get(`/docs/${docName}`)
            this.detail = md
            this.$nextTick(() => {
                editormd.markdownToHTML('md-viewer', {
                    previewCodeHighlight: false,
                })
            })
        },
    },
}
</script>
<style lang="less">
.detail-page{
    width: 90%;
    max-width: 800px;
    margin: 0 auto;

    .back-to-index{
        color: #2332a0;
        text-decoration: none;

        &:hover{
            text-decoration: underline;
        }
    }

    .blog-title{
        font-size: 18px;
        font-weight: normal;
        text-align: center;
        border-bottom: 1px solid #efefef;
        box-sizing: border-box;
        margin: 0;
        padding-bottom: 10px;

        small{
            display: block;
            font-size: 12px;
            color: #999999;
            text-align: right;
        }
    }
}
</style>
