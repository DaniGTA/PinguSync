<template>
    <div class="loading-title">{{ loadingTitle }}</div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'

class Props {
    loadingTitle!: string
}

@Options({})
export default class LoadingTitle extends Vue.with(Props) {}
</script>

<style lang="scss" scoped>
.loading-title {
    z-index: 3;
    color: $primary-text;
    font-family: Roboto;
    font-size: 72px;
    font-weight: 300;
    line-height: 115px;
    text-align: center;
    letter-spacing: -1.5px;
}
</style>
