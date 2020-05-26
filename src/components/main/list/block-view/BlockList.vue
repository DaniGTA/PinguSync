<template>
  <div class="block-list-scroll">
      <BlockListEntry v-for="entry in allItems" :key="entry" :id="entry"></BlockListEntry>
  </div>
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
  public renderedItems: string[][] = [];
  public allItems: string[] = [];

  constructor(){
    super();
    this.getList();
  }

  private async getList(): Promise<void> {
   this.allItems = await SeriesListViewController.getSeriesIdsFromCurrentlySelectedListType();
  }
}
</script>

<style>
.main-header{

}
.block-list-scroll{
  height: calc(100vh - 140px);
  overflow-y: scroll;
}

.list-line {
  text-align: center;
}
</style>
