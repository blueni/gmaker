<template>
    <div class="index-page">
        <h4 class="blog-header">Gitpage blog!</h4>
        
        <ul class="doc-list" v-if="summary && summary.docs">
            <li class="doc-item" v-for="(doc, index) in summary.docs" :key="index">
                <a href="javascript:;" @click="gotoBlog(doc)">
                    {{ doc.title }}
                    <span class="blog-time">{{ doc.mtimeMs | time }}</span>
                </a>
            </li>
        </ul>
    </div>
</template>

<script>
export default {
    name: 'index',

    data() {
        return {
            summary: null,
        }        
    },

    filters: {
        time(value) {
            let date = new Date(+value)
            return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日
                    ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}`
        },
    },

    created() {
        this.getSummary()
    },

    methods: {
        async getSummary() {
            let summary = await this.$get('/data/summary.json')
            this.summary = summary
        },

        gotoBlog(blog) {
            this.$store.commit('blog', blog)
            this.$router.push(`/detail/${blog.name}`)
        },
    },
}
</script>

<style lang="less">
.index-page{
    width: 90%;
    max-width: 800px;
    margin: 0 auto;

    .blog-header{
        text-align: center;
        margin: 0;
    }

    .doc-list{
        list-style: none;
        margin: 20px 0 0 0;
        padding: 0;

        li{
            border-top: 1px solid #eaeaea;

            &:last-child{
                border-bottom: 1px solid #eaeaea;
            }
        }

        a{
            display: block;
            line-height: 50px;
            color: #666666;
            text-decoration: none;
            padding: 0 10px;

            &:hover{
                background: #f0f0f0;
            }
        }

        .blog-time{
            font-size: 12px;
            color: #999999;
            float: right;
        }
    }
}
</style>
