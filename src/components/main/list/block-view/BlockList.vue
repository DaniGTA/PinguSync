<template>
  <div class="block-list">
      <div class="block-list-title-box">
        <div class="block-list-title">{{$t(title +'_LISTTYPE')}}</div>
        <q-separator class="block-list-title-line" />
      </div>
      <BlockListEntry v-for="entry in syncedItems" :key="entry" :id="entry"></BlockListEntry>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import BlockListEntry from './entry/BlockListEntry.vue';
import { PropSync, Prop } from 'vue-property-decorator';
import { ListType } from '../../../../backend/controller/settings/models/provider/list-types';

@Component({
	components: {
    BlockListEntry
	}
})
export default class BlockList extends Vue {
  @PropSync('items')
  public syncedItems!: string[];
  @Prop()
  public title!: ListType;
}
</script>

<style scoped>
.block-list{
}

.block-list-title-box{
    display: flex;
    align-items: center;
}

.block-list-title-line {
  background: white;
  margin: 0px 5px;
  width: auto;
}

.list-line {
  text-align: center;
}
.block-list-title{
  color: white;
  margin: 0px 10px;
  display: inline;
  font-size: 28px;
}
</style>
