<template>
    <div class="gmaker-app" :class="{'no-scroll': loading}">
        <div class="page-header">
            <router-link to="/">
                <strong class="v-log">GMaker</strong>
            </router-link>
            <div class="description">
                一键打造静态网站
            </div>

            <a class="header-link" href="https://www.github.com/blueni/gmaker" target="__blank">GitHub</a>
            <router-link v-if="isLocal" class="header-link" to="/admin">Admin</router-link>
        </div>

        <div class="err-tip" :class="{ show: error }" v-show="error">
            <div class="err-content">
                {{ error }}
            </div>
            <span class="close-err" @click="$store.commit('error', '')">×</span>
        </div>
        <router-view></router-view>
        <g-loading-1 animate="scale" class="global-loading" v-show="loading"></g-loading-1>
    </div>
</template>

<script>
import gLoading1 from '../components/loading1.vue'
import { mapState } from 'vuex'

export default {
    name: 'app',

    components: {
        gLoading1,
    },

    computed: {
        ...mapState(['loading', 'error']),

        isLocal() {
            let hostname = location.hostname
            return hostname.indexOf('localhost') >= 0 || hostname.indexOf('127.0.0.1') >= 0
        },
    },
}
</script>


<style lang="less">
*{
    font-size: 14px;
    border: none;
    margin: 0;
    padding: 0;
    text-decoration: none;
    box-sizing: border-box;
}
::-webkit-scrollbar{
    width: 8px;
}
::-webkit-scrollbar-track-piece{
    background: #000000;
}
::-webkit-scrollbar-thumb{
    background: #666666;
    border-radius: 2px;
}
.no-scroll{
    height: 100%;
    overflow: hidden;
}

@white: #ffffff;

.white() {
    color: @white;
}

.page-content{
    width: 96%;
    max-width: 1200px;
    margin: 0 auto;
}
.page-header{
    height: 60px;
    background: #333333;
    border-bottom: 1px solid #666666;
    position: relative;
    z-index: 2;

    .v-log{
        .white;
        font-size: 32px;
        line-height: 60px;
        margin-left: 8px;
    }

    .description{
        display: inline-block;
        .white;
        margin-left: 10px;
        font-size: .8em;
        line-height: 1.4em;
    }

    .header-link{
        float: right;
        line-height: 60px;
        .white;
        font-size: .8em;
        margin-right: 8px;

        &:hover{
            text-decoration: underline;
        }
    }
}

.err-tip{
    display: flex;
    justify-content: flex-end;
    align-items: stretch;
    background: #fefeea;
    border: 1px solid #dadada;
    box-shadow: 1px 1px 2px rgba(32, 32, 0, .5);
    position: fixed;
    right: 5px;
    top: -1000px;
    z-index: 10;
    transition: top .3s ease-in-out;

    &.show{
        top: 100px;
    }

    .err-content{
        max-width: 300px;
        color: #fe3333;
        font-size: 14px;
        word-break: break-word;
        padding: 10px;
    }

    .close-err{
        width: 30px;
        display: flex;
        justify-content: center;
        align-items: flex-start;
        font-size: 24px;
        color: #333333;
        cursor: pointer;
    }
}

.global-loading{
    display: flex;
    justify-content: center;
    align-items: center;
    background: rgba(0, 0, 0, .3);
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    z-index: 99999;
}
</style>