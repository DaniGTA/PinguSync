<template>
    <div class="main-header-title-box">
        <div class="main-header-title" @click="openDefaultSite()">PinguSync</div>
        <q-badge color="primary"><VersionText class="main-header-title-version-text" /></q-badge>
    </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'
import VersionText from '../../system/version/VersionText.vue'

@Options({
    components: {
        VersionText,
    },
})
export default class MainHeaderTitle extends Vue {
    async openDefaultSite(): Promise<void> {
        if (window.electron.controller.frontendSettingsController.userSettingsController.isFirstSetupFinished()) {
            await this.$router.push({ name: 'List' })
        } else {
            await this.$router.push('setup')
        }
    }
}
</script>

<style lang="scss" scoped>
.main-header-title-box {
    margin: 5px;
}

.main-header-title {
    cursor: pointer;
    font-size: 24px;
    color: $primary-text;
}
</style>
