<template>
  <div>
    <BlockListEntrySyncStatus :seriesId="seriesId"/>
      <SeriesImageBlock class="block-list-entry-img" :seriesId="seriesId" />
      <BlockListEntryInfoSection :seriesId="seriesId" />
  </div>
</template>

<script>
import SeriesImageBlock from '../../../../elements/series-elements/SeriesImageBlock.vue';
import BlockListEntryInfoSection from './BlockListEntryInfoSection.vue';
import BlockListEntrySyncStatus from './sync-status/BlockListEntrySyncStatus.vue';

export default {
    components: {
        SeriesImageBlock,
        BlockListEntryInfoSection,
        BlockListEntrySyncStatus,
    },
    props: {
        seriesId: ''
    }
}
</script>

<style scoped>

.block-list-entry-img{
  height: 205px;
  border-radius: 5px;
  overflow: hidden;
}
</style>