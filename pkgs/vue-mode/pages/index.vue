<template>
    <div class="index-page">
        <div class="page-categories">
            <div class="page-content">
                <div class="nav-box">
                    <a
                        href="javascript:;"
                        class="nav-item"
                        :class="{active: !currentCategory}"
                        @click="changeCategory('')"
                    >
                        Home
                    </a>
                    <a
                        href="javascript:;"
                        class="nav-item"
                        :class="{active: category === currentCategory}"
                        v-for="(category, index) in categories"
                        :key="index"
                        @click="changeCategory(category)"
                    >
                        {{ category }}
                    </a>
                </div>
            </div>
        </div>

        <router-view v-if="categories.length"></router-view>

        <div class="page-footer">By Blueni</div>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    name: 'index',

    computed: {
        ...mapState(['categories', 'currentCategory']),
    },

    async created() {
        let category = this.$route.query.category || ''
        this.$store.commit('currentCategory', category)

        await this.getCategories()
    },

    methods: {
        async getCategories() {
            let categories = await this.$sdk.getCategories()
            this.$store.commit('categories', categories)
        },

        changeCategory(category) {
            this.$router.replace({
                path: '/',
                query: {
                    category,
                },
            })
            this.$store.commit('currentCategory', category)
        },
    },
}
</script>

<style lang="less">
.index-page{
    padding-bottom: 40px;

    .page-categories {
        height: 40px;
        background: #333333;
        box-shadow: 0 2px 2px #666666;

        .nav-item{
            display: inline-block;
            line-height: 40px;
            color: #ffffff;
            padding: 0 10px;

            &.active{
                background: #666666;
            }
        }
    }

    .page-footer{
        width: 100%;
        height: 40px;
        line-height: 40px;
        font-size: 16px;
        text-align: center;
        margin-top: 20px;
        background: rgba(255, 255, 255, .8);
        box-shadow: 0 0 2px #333333;
        position: fixed;
        bottom: 0;
    }
}

</style>
