<template>
  <q-intersection class="block-list-entry-container" once transition="scale">
    <div class="block-list-entry" v-intersection="onIntersection" @mouseover="isHovering()"
    @mouseleave="isNotHovering()" @click="openDetailView()">
    <template v-if="id && visible">
      <BlockListEntryDetails :seriesId="id"/>
      <q-menu @mouseover="isHovering()" @mouseleave="isNotHovering()" anchor="top right" self="top left" content-class="hover-content"  v-model="hover" scroll-target=".block-list-entry">
        <BlockListEntrySyncStatusHover :seriesId="id"/>
      </q-menu>
    </template>
    </div>
  </q-intersection>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import BlockListEntryDetails from './BlockListEntryDetails.vue';
import BlockListEntrySyncStatusHover from './sync-status/BlockListEntrySyncStatusHover.vue';

@Component({
	components: {
    BlockListEntrySyncStatusHover,
    BlockListEntryDetails
	}
})
export default class BlockEntry extends Vue {
  @Prop()
  public id!: string;
  public visible = false;

  private hover = false;
  private newHoverStatus = false;
  
  onIntersection(entry: IntersectionObserverEntry): void {
    this.visible = entry.isIntersecting;
  }

  public openDetailView(): void{
    this.$router.push({name: 'SeriesDetail', params: {id: this.id}});
  }

  public isHovering(): void{
    this.hover = true;
    this.newHoverStatus = true;
  }

  public async isNotHovering(): Promise<void>{
    this.newHoverStatus = false;
    await this.sleep(25);
    this.hover = this.newHoverStatus;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
</script>

<style scoped>
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
