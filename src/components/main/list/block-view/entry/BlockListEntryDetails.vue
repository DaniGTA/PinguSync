<template>
    <div v-if="seriesId">
        <BlockListEntrySyncStatus :seriesId="seriesId" />
        <SeriesImageBlock :seriesId="seriesId" />
        <BlockListEntryInfoSection :seriesId="seriesId" />
    </div>
</template>

<script lang="ts">
import { Vue, Options, prop, WithDefault } from 'vue-class-component'
import SeriesImageBlock from '../../../../elements/series-elements/SeriesImageBlock.vue'
import BlockListEntryInfoSection from './BlockListEntryInfoSection.vue'
import BlockListEntrySyncStatus from './sync-status/BlockListEntrySyncStatus.vue'
class Props {
    seriesId: WithDefault<string> = prop<string>({ default: '' })
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
