<template>
    <div class="series-name-block-text">
        <template v-if="name">
            {{ name }}
        </template>
        <template v-else>
            <q-skeleton type="text" animation="fade" />
            <q-skeleton type="text" animation="fade" />
        </template>
    </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'
import SeriesListViewController from '../../controller/series-list-view-controller'

class Props {
    seriesId!: string
}

@Options({})
export default class ProviderImageBlock extends Vue.with(Props) {
    public name = ''

    public async mounted(): Promise<void> {
        this.name = (await SeriesListViewController.getSeriesNameById(this.seriesId)) ?? ''
    }
}
</script>

<style>
.series-name-block-text {
    color: #f5eeee;
    z-index: 100;
}
</style>
