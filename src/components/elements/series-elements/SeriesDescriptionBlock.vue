<template>
    <div>
        <div class="font-medium">{{ $t('Main.Series.Description') }}:</div>
        <div v-if="description" class="text-black text-justify">
            {{ description.content }}
        </div>
        <div v-else class="flex-1 space-y-2 py-1 animate-pulse">
            <div class="rounded bg-blue-400 h-4 w-3/5"></div>
            <div class="rounded bg-blue-400 h-4 w-5/6"></div>
            <div class="rounded bg-blue-400 h-4 w-4/5"></div>
            <div class="rounded bg-blue-400 h-4 w-2/5"></div>
            <div class="rounded bg-blue-400 h-4 w-1/5"></div>
        </div>
    </div>
</template>

<script lang="ts">
import Overview from '@backend/controller/objects/meta/overview'
import { Vue, Options, prop, WithDefault } from 'vue-class-component'
import SeriesListViewController from '../../controller/series-list-view-controller'

class Props {
    seriesId: WithDefault<string> = prop<string>({ default: '' })
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
