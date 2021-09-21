<template>
    <Intersect @enter="this.loadSeriesName()">
        <template>
            {{ name }}
        </template>
    </Intersect>
</template>

<script lang="ts">
import { Vue, Options, prop, WithDefault } from 'vue-class-component'
import SeriesListViewController from '../../controller/series-list-view-controller'
import Intersect from 'vue-intersect'

class Props {
    seriesId: WithDefault<string> = prop<string>({ default: '' })
}

@Options({
    components: {
        Intersect,
    },
})
export default class ProviderImageBlock extends Vue.with(Props) {
    public name = ''

    async loadSeriesName() {
        try {
            this.name = (await SeriesListViewController.getSeriesNameById(this.seriesId)) ?? ''
        } catch (err) {
            console.error(err as string)
        }
    }
}
</script>
