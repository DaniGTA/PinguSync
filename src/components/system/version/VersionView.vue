<template>
    <div id="version">
        <button @click="installUpdate()" class="update" v-if="updateReady">
            <i class="fas fa-download"></i></button
        ><VersionText />
    </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'
import VersionText from './VersionText.vue'

@Options({
    components: { VersionText },
})
export default class VersionView extends Vue {
    public updateReady = false
    constructor() {
        super()
        //TODO on Update Ready
    }

    public installUpdate(): void {
        window.electron.controller.appController.updateController.isUpdateAvailable()
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

.update {
    width: fit-content;
    display: inline-block;
    color: green;
    margin: 0px 5px;
}
</style>
