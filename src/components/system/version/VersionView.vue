<template>
    <div class="m-1 text-gray-400 absolute bottom-0 right-0 text-left">
        <button @click="installUpdate()" class="text-green-600 inline-block" v-if="updateReady">
            <i class="fas fa-download"></i></button
        ><VersionText />
    </div>
</template>

<script lang="ts">
import WorkerController from '@/backend/communication/ipc-renderer-controller'
import { chListener } from '@/backend/communication/listener-channels'
import { chSend } from '@/backend/communication/send-only-channels'
import { Vue, Options } from 'vue-class-component'
import VersionText from './VersionText.vue'

@Options({
    components: { VersionText },
})
export default class VersionView extends Vue {
    public updateReady = false
    constructor() {
        super()
        WorkerController.on(chListener.OnUpdateReady, () => {
            this.updateReady = true
        })
    }

    public installUpdate(): void {
        WorkerController.send(chSend.QuitAndInstall)
    }
}
</script>

<style>
#version {
    margin-right: 2px;
    color: gray;
    position: absolute;
    text-align: left;
    bottom: 0;
    right: 0;
    width: fit-content;
}
</style>
