<template>
    <div>
        <BlockListEntrySyncStatus :seriesId="seriesId" />
        <SeriesImageBlock class="block-list-entry-img" :seriesId="seriesId" />
        <BlockListEntryInfoSection :seriesId="seriesId" />
    </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'
import SeriesImageBlock from '../../../../elements/series-elements/SeriesImageBlock.vue'
import BlockListEntryInfoSection from './BlockListEntryInfoSection.vue'
import BlockListEntrySyncStatus from './sync-status/BlockListEntrySyncStatus.vue'
class Props {
    seriesId!: string
}

@Options({
    components: {
        SeriesImageBlock,
        BlockListEntryInfoSection,
        BlockListEntrySyncStatus,
    },
})
export default class BlockEntry extends Vue.with(Props) {}
</script>

<style scoped>
.block-list-entry-img {
    height: 205px;
    border-radius: 5px;
    overflow: hidden;
}
</style>
