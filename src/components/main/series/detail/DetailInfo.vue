<template>
    <div v-if="id">
        <div class="series-basic-info-header">
            <SeriesImageBlock class="w-60 shadow-md" :seriesId="id" />
            <div>
                <div class="text-5xl text-black font-bold mb-4 ml-8"><SeriesNameBlock :seriesId="id" /></div>

                <div class="p-8 shadow-xl">
                    <DetailInfoSyncStatus :seriesId="id" />
                    <SeriesDescriptionBlock :seriesId="id" />
                </div>
            </div>
            <button @click="saveSeries()">Save Series</button>
        </div>
        Id: {{ id }}
        <DetailInfoEpisodes :seriesId="id" />
    </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'
import SeriesImageBlock from '../../../elements/series-elements/SeriesImageBlock.vue'
import SeriesNameBlock from '../../../elements/series-elements/SeriesNameBlock.vue'
import SeriesDescriptionBlock from '../../../elements/series-elements/SeriesDescriptionBlock.vue'
import DetailInfoSyncStatus from './DetailInfoSyncStatus.vue'
import DetailInfoEpisodes from './DetailInfoEpisodes.vue'
import SeriesListViewController from '../../../controller/series-list-view-controller'

@Options({
    components: {
        SeriesImageBlock,
        SeriesNameBlock,
        SeriesDescriptionBlock,
        DetailInfoSyncStatus,
        DetailInfoEpisodes,
    },
})
export default class SeriesDetailInfo extends Vue {
    private id: string | null = null
    public mounted(): void {
        this.id = this.$route.params.id as string
        console.log(`SeriesId: ${this.id}`)
    }

    public saveSeries(): void {
        if (this.id) {
            SeriesListViewController.saveSeriesInDB(this.id)
        }
    }
}
</script>

<style lang="scss" scoped>
.series-basic-info-header {
    margin: 15px;
    display: grid;
    grid-template-columns: 250px 1fr;
    grid-template-rows: 1fr;
    gap: 1px 1px;
    grid-template-areas: '. .';
}
</style>
