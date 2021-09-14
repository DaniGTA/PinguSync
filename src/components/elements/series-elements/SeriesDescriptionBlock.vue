<template>
    <div v-if="description" class="describtion">
        {{ description.content }}
    </div>
</template>

<script lang="ts">
import Overview from '@backend/controller/objects/meta/overview'
import { Vue, Options } from 'vue-class-component'
import SeriesListViewController from '../../controller/series-list-view-controller'

class Props {
    seriesId!: string
}

@Options({})
export default class SeriesDescriptionBlock extends Vue.with(Props) {
    description: Overview | null = null
    mounted(): void {
        this.loadDescription()
    }
    async loadDescription(): Promise<void> {
        this.description = (await SeriesListViewController.getSeriesDescriptionById(this.seriesId)) ?? null
    }
}
</script>

<style lang="scss" scoped>
.describtion {
    color: $primary-text;
}
</style>
