<template>
    <div class="h-100">
        <MainHeader />
        <div class="h-100">
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
