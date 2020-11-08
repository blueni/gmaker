<template>
    <div class="detail-page" v-if="blog">
        <div class="page-content">
            <h4 class="blog-title">
                {{ blog.title }}
                <small>{{ blog.stats.mtimeMs | time }}</small>
            </h4>
            <div class="doc-content" id="md-viewer" v-show="detail">
                <textarea style="display: none" :value="detail"></textarea>
                <!-- <div v-html="html"></div> -->
            </div>
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

    async created() {
        let id = this.$route.params.id
        if (!this.blog) {
            let blog = await this.$sdk.getDocDescription(id)
            this.$store.commit('blog', blog)
        }
        document.title = this.blog.title
        this.getDetail({ id })
    },

    methods: {
        async getDetail(doc) {
            let md = await this.$sdk.getDetail(doc)
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
    margin-top: 20px;

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
