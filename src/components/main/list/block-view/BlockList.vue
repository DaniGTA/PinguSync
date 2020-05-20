<template>
    <q-virtual-scroll
    style="max-height: 300px; overflow-x: hidden"
    :items="items"
    :virtual-scroll-item-size="205"
    :virtual-scroll-slice-size="80"
    separator
  >
    <template v-slot="{ item, index }">
      <BlockListEntry :key="index" :index="index" :id="item"></BlockListEntry>
    </template>
  </q-virtual-scroll>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import BlockListEntry from './entry/BlockListEntry.vue';
import SeriesListViewController from '../../../controller/series-list-view-controller';

@Component({
	components: {
    BlockListEntry
	}
})
export default class BlockList extends Vue {
  public size = 0;
  public items: string[] = [];
  constructor(){
    super();
    this.getList();
  }
  public async getList(): Promise<void> {
    const list = await SeriesListViewController.getSeriesIdsFromCurrentlySelectedListType();
    this.size = list.length;
    this.items = list;
  }
}
</script>

<style>
.main-header{

}
</style>
