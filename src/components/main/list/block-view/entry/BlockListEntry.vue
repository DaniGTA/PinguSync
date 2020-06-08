<template>
  <q-intersection class="block-list-entry-container" once transition="scale">
    <div class="block-list-entry" v-intersection="onIntersection">
    <template v-if="id && visible">
      <BlockListEntrySyncStatus :seriesId="id"/>
      <SeriesImageBlock class="block-list-entry-img" :seriesId="id" />
      <BlockListEntryInfoSection :seriesId="id" />
    </template>
    </div>
  </q-intersection>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import SeriesImageBlock from '../../../../elements/series-elements/SeriesImageBlock.vue';
import BlockListEntryInfoSection from './BlockListEntryInfoSection.vue';
import BlockListEntrySyncStatus from './sync-status/BlockListEntrySyncStatus.vue';
@Component({
	components: {
    SeriesImageBlock,
    BlockListEntryInfoSection,
    BlockListEntrySyncStatus
	}
})
export default class BlockEntry extends Vue {
  @Prop()
  public id!: string;

  public visible = false;
  onIntersection(entry: IntersectionObserverEntry): void {
    this.visible = entry.isIntersecting;
  }
}
</script>

<style>
.block-list-entry{
  width: 150px;
  height: 285px;
  display: inline-block;
  overflow: hidden;
}
.block-list-entry-container{
  display: inline-block;
  margin: 10px;
}

.block-list-entry-img{
  height: 205px;
  border-radius: 5px;
  overflow: hidden;
}
</style>
