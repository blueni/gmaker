<template>
    <div class="g-loading g-loading-1">
        <div class="block-content">
            <div 
                class="block"
                v-for="i in 8"
                :key="i"
                :class="[`block${i}`, `g-animate-${animate}`]"
                :style="{
                    width,
                    height,
                }"
            >
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'g-loading-1',

    props: {
        // 值可以为 rotate, translate, scale, skew, opacity
        animate: {
            type: String,
            default: 'rotate',
        },

        // 每个加载小方块的宽度
        width: {
            type: String,
            default: '10px',
        },

        // 每个加载小方块的高度
        height: {
            type: String,
            default: '30px',
        },        
    },
}
</script>

<style lang="less">
@keyframes g-loading-rotate{
    10%{
        transform: rotateY(90deg)
    }
    20%{
        transform: rotateY(0)
    }
}

@keyframes g-loading-scale{
    10%{
        transform: scaleY(1.8)
    }
    20%{
        transform: scaleY(1)
    }
}

@keyframes g-loading-translate{
    10%{
        transform: translateX(5px)
    }
    20%{
        transform: translateX(0)
    }
}

@keyframes g-loading-skew{
    10%{
        transform: skewY(45deg)
    }
    20%{
        transform: skewY(0)
    }
}

@keyframes g-loading-opacity{
    10%{
        opacity: .2
    }
    20%{
        opacity: 1
    }
}

.g-loading-1{
    display: flex;
    justify-content: center;
    align-items: center;

    .block-content{
        display: flex;
        justify-content: center;
    }

    .block{
        background: #333333;
        margin: 0 2px;
    }

    .loop(@counter) when (@counter > 0) {
        .loop(@counter - 1);

        .block@{counter}{
            &.g-animate-rotate{
                animation: g-loading-rotate 1.5s ease-in 180ms * (@counter - 1) infinite;
            }

            &.g-animate-scale{
                animation: g-loading-scale 1.5s ease-in 180ms * (@counter - 1) infinite;
            }

            &.g-animate-translate{
                animation: g-loading-translate 1.5s ease-in 180ms * (@counter - 1) infinite;
            }

            &.g-animate-skew{
                animation: g-loading-skew 1.5s ease-in 180ms * (@counter - 1) infinite;
            }

            &.g-animate-opacity{
                animation: g-loading-opacity 1.5s ease-in 180ms * (@counter - 1) infinite;
            }
        }
    }

    .loop(8);
}
</style>