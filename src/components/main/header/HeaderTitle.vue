<template>
  <div class="main-header-title-box">
      <div class="main-header-title" @click="openDefaultSite()">PinguSync</div>
      <q-badge color="primary"><VersionText class="main-header-title-version-text"/></q-badge>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import VersionText from '../../system/version/VersionText.vue';
import { chOnce } from '../../../backend/communication/channels';
import WorkerController from '../../../backend/communication/ipc-renderer-controller';
@Component({
	components: {
        VersionText
	}
})
export default class MainHeaderTitle extends Vue {
    private workerController: WorkerController = new WorkerController();

    async openDefaultSite(): Promise<void>{
    if(await this.workerController.getOnce<boolean>(chOnce.FinishedFirstSetup)){
      await this.$router.push({name:'List'});
    }else{
      await this.$router.push('setup');
    }
    }
}
</script>

<style lang="scss" scoped>
.main-header-title-box{
    margin: 5px;
}

.main-header-title{
    cursor: pointer;
    font-size: 24px;
    color: $primary-text;
}
</style>