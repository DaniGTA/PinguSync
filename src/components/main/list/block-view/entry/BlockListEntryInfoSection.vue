<template>
  <div class="block-list-entry-info-section">
      <q-btn color="white" text-color="black" label="Update EP List" @click="updateEpList"/>
      <SeriesNameBlock :seriesId="seriesId" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import SeriesNameBlock from './../../../../elements/series-elements/SeriesNameBlock.vue';
import WorkerController from '../../../../../backend/communication/ipc-renderer-controller';
import { chListener } from '../../../../../backend/communication/listener-channels';
@Component({
	components: {
        SeriesNameBlock
	}
})
export default class BlockEntry extends Vue {
  private workerController: WorkerController = new WorkerController();

  @Prop()
  public seriesId!: string;

  updateEpList(): void {
    this.workerController.send(chListener.OnSeriesEpisodeListRefreshRequest, this.seriesId);
  }

}
</script>
<style>
.block-list-entry-info-section{

}
</style>