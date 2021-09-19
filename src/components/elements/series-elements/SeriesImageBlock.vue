<template>
    <div v-if="seriesId">
        <Intersect @enter="loadImg()">
            <img class="h-100 w-100 shadow-md rounded" :src="url" />
        </Intersect>
    </div>
</template>

<script lang="ts">
import { FailedCover } from '@backend/controller/frontend/series/model/failed-cover'
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
    public url = ''
    private failedUrls: string[] = []

    private async loadImg(): Promise<void> {
        if (!this.url) {
            const result = (await SeriesListViewController.getSeriesCoverUrlById(this.seriesId)) ?? ''
            if (!this.failedUrls.find(x => x == result)) {
                this.url = result
            }
        }
    }

    private async onImageError(): Promise<void> {
        if (this.url) {
            const failedCover: FailedCover = {
                seriesId: this.seriesId,
                coverUrl: this.url,
            }
            SeriesListViewController.sendFailedCover(failedCover)
            this.failedUrls.push(this.url)
            this.url = ''
            await this.wait(750)
            await this.loadImg()
        } else {
            console.error('No image src')
        }
    }

    private async wait(ms = 500): Promise<void> {
        await new Promise(resolve => setTimeout(resolve, ms))
    }
}
</script>
