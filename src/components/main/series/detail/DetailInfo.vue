<template>
    <div v-if="id">
        <div class="series-basic-info-header">
            <SeriesImageBlock class="detail-info-img" :seriesId="id" />
            <div class="series-basic-info">
                <SeriesNameBlock class="text-h3" :seriesId="id" />
                <DetailInfoSyncStatus :seriesId="id" />
                <SeriesDescriptionBlock :seriesId="id" />
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

.series-basic-info {
    background: $primary-background;
    margin: 35px 0px;
}

.detail-info-img {
    width: 250px;
    z-index: 10;
    box-shadow: black 0px 0px 5px 1px;
}
</style>
