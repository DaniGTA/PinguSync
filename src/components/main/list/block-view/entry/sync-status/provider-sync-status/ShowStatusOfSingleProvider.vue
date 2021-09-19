<template>
    <div class="col m-4" v-if="provider">
        <ProviderImageBlock :provider="provider" :showText="false" />
        <div class="m-1">
            <div v-if="result === null" class="h-4 w-5 bg-blue-400 rounded animate-pulse">-</div>
            <div v-if="isSync()" class="h-4 w-5 bg-green-500"></div>
            <div class="h-4" v-if="!isSync() && result !== null">
                {{ result.syncedEpisodeCount }}/{{ result.maxEpisodeNumber }}
            </div>
        </div>
        <button @click="sync()">Sync</button>
    </div>
</template>

<script lang="ts">
import { Vue, Options, prop, WithDefault } from 'vue-class-component'
import ProviderImageBlock from './../../../../../../elements/provider-elements/ProviderImageBlock.vue'
import ProviderController from '../../../../../../controller/provider-controller'
import { ListProviderInterface } from '../../../../../../controller/model/list-provider-interface'
import GetSyncStatusRecieved from '@backend/controller/frontend/providers/sync-status/model/get-sync-status-recieved'
import FrontendSyncEpisodes from '@backend/controller/frontend/providers/sync-status/model/sync-episodes'

class Props {
    provider: WithDefault<ListProviderInterface> = prop<ListProviderInterface>({ default: null })
    seriesId: WithDefault<string> = prop<string>({ default: '' })
}

@Options({
    components: {
        ProviderImageBlock,
    },
})
export default class ShowStatusOfSingleProvider extends Vue.with(Props) {
    public result: GetSyncStatusRecieved | null = null

    async mounted(): Promise<void> {
        try {
            this.result = await this.isSynced()
        } catch (err) {
            console.error(err)
        }
    }

    beforeDestroyed(): void {
        this.isSynced = (async () => {
            console.log('Closed IsSynced request')
        }) as any
    }

    async isSynced(): Promise<GetSyncStatusRecieved> {
        return ProviderController.isProviderSync({
            providerName: this.provider.providerName,
            seriesId: this.seriesId,
        })
    }

    sync(): void {
        ProviderController.syncAllEpisodes({
            providerName: this.provider.providerName,
            seriesId: this.seriesId,
        } as FrontendSyncEpisodes)
    }

    isSync(): boolean {
        return this?.result?.isSync ?? false
    }

    delay(ms: number) {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}
</script>
