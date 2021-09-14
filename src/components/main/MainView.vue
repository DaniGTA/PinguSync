<template>
    <div class="layout" view="hHh lpR fFf main">
        <MainHeader />
        <div class="container page">
            <router-view />
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'
import MainHeader from './header/HeaderView.vue'

@Options({
    components: {
        MainHeader,
    },
})
export default class Main extends Vue {}
</script>

<style scoped>
.main {
    height: 100%;
}
.page {
    height: 100%;
}
</style>
