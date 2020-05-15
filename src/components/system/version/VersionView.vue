<template>
  <div id="version">
    <button @click="installUpdate()" class="update" v-if="updateReady">
      <i class="fas fa-download"></i>
    </button><VersionText/></div>
</template>

<script lang="ts">
import Component from 'vue-class-component';
import Vue from 'vue';
import WorkerController from '../../../backend/communication/ipc-renderer-controller';
import { chListener } from '../../../backend/communication/listener-channels';
import { chSend } from '../../../backend/communication/send-only-channels';
import VersionText from './VersionText.vue';

@Component({
	components: {
      VersionText
	}
})
export default class Providers extends Vue {
  public workerController: WorkerController = new WorkerController();
  public updateReady = false;
  constructor(){
    super();
    this.workerController.on(chListener.OnUpdateReady, ()=> {
      this.updateReady = true;
    });
  }

  public installUpdate(): void{
    this.workerController.send(chSend.QuitAndInstall);
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

.update{
  width: fit-content;
  display: inline-block;
  color: green;
  margin: 0px 5px;
}
</style>