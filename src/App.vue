<template>
    <router-view />
</template>
<script lang="ts">
import { Vue } from 'vue-class-component'
import { chOnce } from './backend/communication/channels'
import WorkerController from './backend/communication/ipc-renderer-controller'
import './index.css'

export default class App extends Vue {
    async mounted(): Promise<void> {
        if (await WorkerController.getOnce<boolean>(chOnce.FinishedFirstSetup)) {
            await this.$router.push({ name: 'List' })
        } else {
            await this.$router.push('setup')
        }
    }
}
</script>
