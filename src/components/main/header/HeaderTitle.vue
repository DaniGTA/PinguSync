<template>
    <div class="m-2">
        <h2 class="cursor-pointer" @click="openDefaultSite()">PinguSync</h2>
        <div
            class="inline-flex items-center justify-center px-2 py-1 mr-2 text-xs font-bold leading-none text-white bg-green-600 rounded-full"
        >
            <VersionText />
        </div>
    </div>
</template>

<script lang="ts">
import { chOnce } from '@/backend/communication/channels'
import WorkerController from '@/backend/communication/ipc-renderer-controller'
import { Vue, Options } from 'vue-class-component'
import VersionText from '../../system/version/VersionText.vue'

@Options({
    components: {
        VersionText,
    },
})
export default class MainHeaderTitle extends Vue {
    async openDefaultSite(): Promise<void> {
        if (await WorkerController.getOnce<boolean>(chOnce.FinishedFirstSetup)) {
            await this.$router.push({ name: 'List' })
        } else {
            await this.$router.push('setup')
        }
    }
}
</script>
