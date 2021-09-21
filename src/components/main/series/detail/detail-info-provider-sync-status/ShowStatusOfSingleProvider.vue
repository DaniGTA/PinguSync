<template>
    <div class="w-auto inline-flex mx-4" v-if="id">
        <ProviderImageBlock :provider="provider" :showText="false" />
        <div class="mx-2">
            <div v-if="result && result.isSync" class="text-green-500">Synced</div>
            <div class="text-red-500" v-if="result && !result.isSync">
                <div v-if="result.maxEpisodeNumber == -1">{{ $t('Main.Series.Sync.NoData') }}</div>
                <div v-else>{{ result.syncedEpisodeCount }}/{{ result.maxEpisodeNumber }}</div>
                <button
                    class="h-10 px-5 m-2 text-green-100 transition-colors duration-150 bg-green-700 rounded-lg focus:shadow-outline hover:bg-green-800"
                    @click="sync()"
                >
                    Sync
                </button>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Options, prop, WithDefault } from 'vue-class-component'
import ProviderImageBlock from './../../../../elements/provider-elements/ProviderImageBlock.vue'
import ProviderController from '../../../../controller/provider-controller'
import GetSyncStatusRecieved from '@backend/controller/frontend/providers/sync-status/model/get-sync-status-recieved'
import { ListProviderInterface } from '@/components/controller/model/list-provider-interface'

class Props {
    provider: WithDefault<ListProviderInterface> = prop<ListProviderInterface>({ default: null })
    id: WithDefault<string> = prop<string>({ default: '' })
}

@Options({
    components: {
        ProviderImageBlock,
    },
})
export default class ShowStatusOfSingleProvider extends Vue.with(Props) {
    public result: GetSyncStatusRecieved | null = null

    mounted(): void {
        this.isSynced().then(x => {
            console.log(x)
            this.result = x
        })
    }

    async isSynced(): Promise<GetSyncStatusRecieved> {
        return await ProviderController.isProviderSync({ providerName: this.provider.providerName, seriesId: this.id })
    }

    sync(): void {
        ProviderController.syncAllEpisodes({ providerName: this.provider.providerName, seriesId: this.id })
    }
}
</script>
