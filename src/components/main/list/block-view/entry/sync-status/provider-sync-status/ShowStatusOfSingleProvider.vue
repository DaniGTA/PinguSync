<template>
    <div class="col provider-status">
        <ProviderImageBlock class="row" :provider="provider" :showText="false" />
        <div class="row justify-center status">
            <em v-if="isSync()" color="green" class="fas fa-check"></em>
            <q-skeleton v-else-if="result === null" c size="12px" />
            <div class="bad-status" v-if="!isSync() && result !== null">
                {{ result.syncedEpisodeCount }}/{{ result.maxEpisodeNumber }}
            </div>
        </div>
        <q-btn push color="black" text-color="white" @click.native="sync()">Sync</q-btn>
    </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'
import ProviderImageBlock from './../../../../../../elements/provider-elements/ProviderImageBlock.vue'
import ProviderController from '../../../../../../controller/provider-controller'
import SeriesHoverController from './../../../../../../controller/series-hover-controller'
import { ListProviderInterface } from '../../../../../../controller/model/list-provider-interface'
import GetSyncStatusRecieved from '@backend/controller/frontend/providers/sync-status/model/get-sync-status-recieved'
import FrontendSyncEpisodes from '@backend/controller/frontend/providers/sync-status/model/sync-episodes'

class Props {
    provider!: ListProviderInterface
}

@Options({
    components: {
        ProviderImageBlock,
    },
})
export default class ShowStatusOfSingleProvider extends Vue.with(Props) {
    public result: GetSyncStatusRecieved | null = null

    async created(): Promise<void> {
        await this.delay(500)
        this.result = await this.isSynced()
    }

    beforeDestroyed(): void {
        this.isSynced = (async () => {
            console.log('Closed IsSynced request')
        }) as any
    }

    async isSynced(): Promise<GetSyncStatusRecieved> {
        return ProviderController.isProviderSync({
            providerName: this.provider.providerName,
            seriesId: this.getSeriesId(),
        })
    }

    sync(): void {
        const seriesId = this.getSeriesId()
        ProviderController.syncAllEpisodes({
            providerName: this.provider.providerName,
            seriesId: seriesId,
        } as FrontendSyncEpisodes)
    }

    private getSeriesId(): string {
        console.log('Save hover entry id: ' + SeriesHoverController.currentlyHoveringSeriesId)
        return SeriesHoverController.currentlyHoveringSeriesId
    }

    isSync(): boolean {
        return this?.result?.isSync ?? false
    }

    delay(ms: number) {
        return new Promise((resolve) => setTimeout(resolve, ms))
    }
}
</script>

<style scoped>
.status {
    height: 20px;
}
.provider-status {
    margin: 5px;
}
.bad-status {
    color: red;
    font-weight: bold;
}
</style>
