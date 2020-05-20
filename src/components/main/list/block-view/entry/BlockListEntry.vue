<template>
  <div class="block-list-entry">
    <template v-if="series !== null">
      <SeriesImageBlock :series="series" />
    </template>
    <template v-else>
      Error: {{id}}
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import FrontendSeriesInfos from '../../../../../backend/controller/objects/transfer/frontend-series-infos';
import SeriesListViewController from '../../../../controller/series-list-view-controller';
import SeriesImageBlock from '../../../../elements/series-elements/SeriesImageBlock.vue';
@Component({
	components: {
    SeriesImageBlock
	}
})
export default class BlockEntry extends Vue {
  @Prop()
  public id!: string;
  public series: FrontendSeriesInfos | null = null;

  async mounted(): Promise<void>{
    console.log(this.id);
    this.series = await SeriesListViewController.getSeriesById(this.id);
  }
}
</script>

<style>
.block-list-entry{
  width: 150px;
  height: 205px;
  border-radius: 5px;
  display: inline-block;
  overflow: hidden;
}
</style>
