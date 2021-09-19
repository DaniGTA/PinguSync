<template>
    <div reveal class="w-100 flex h-16 bg-white shadow-md">
        <HeaderTitle />
        <ProviderList />
    </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'
import ProviderList from './provider/ProviderList.vue'
import HeaderTitle from './HeaderTitle.vue'

@Options({
    components: {
        ProviderList,
        HeaderTitle,
    },
})
export default class MainHeader extends Vue {}
</script>

<style scoped lang="scss">
.main-header {
    width: 100%;
    height: 70px;
    display: flex;
}
</style>
