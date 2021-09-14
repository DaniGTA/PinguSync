<template>
    <div class="series-image-block">
        <q-img class="series-image-block" :src="url" transition="fade" @error="onImageError">
            <template v-slot:loading>
                <q-skeleton square width="100%" height="100%" animation="fade" />
            </template>
        </q-img>
    </div>
</template>

<script lang="ts">
import { FailedCover } from '@backend/controller/frontend/series/model/failed-cover'
import { Vue, Options } from 'vue-class-component'
import SeriesListViewController from '../../controller/series-list-view-controller'

class Props {
    seriesId!: string
}

@Options({})
export default class ProviderImageBlock extends Vue.with(Props) {
    public url = ''
    private failedUrls: string[] = []

    public mounted(): void {
        this.loadImg()
    }

    private async loadImg(): Promise<void> {
        const result = (await SeriesListViewController.getSeriesCoverUrlById(this.seriesId)) ?? ''
        if (!this.failedUrls.find((x) => x == result)) {
            this.url = result
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
        await new Promise((resolve) => setTimeout(resolve, ms))
    }
}
</script>

<style>
.series-image-block {
    height: 100%;
    width: 100%;
}

.series-image-block img {
    height: 100%;
    width: 100%;
}
</style>
