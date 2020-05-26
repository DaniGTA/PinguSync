<template>
  <div class="block-list-entry-info-section">
      <SeriesNameBlock :seriesId="seriesId" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import SeriesNameBlock from './../../../../elements/series-elements/SeriesNameBlock.vue';
@Component({
	components: {
        SeriesNameBlock
	}
})
export default class BlockEntry extends Vue {
  @Prop()
  public seriesId!: string;


}
</script>
<style>
.block-list-entry-info-section{

}
</style>