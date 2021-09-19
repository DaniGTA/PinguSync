<template>
    <div class="row provider-status" v-if="id">
        <ProviderImageBlock class="col provider-img" :provider="provider" :showText="false" size="25" />
        <div class="col justify-center status">
            <i v-if="result && result.isSync" color="green" class="fas fa-check success-status"></i>
            <div class="bad-status" v-if="result && !result.isSync">
                {{ result.syncedEpisodeCount }}/{{ result.maxEpisodeNumber }}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'
import ProviderImageBlock from './../../../../elements/provider-elements/ProviderImageBlock.vue'

import ProviderController from '../../../../controller/provider-controller'
import ListProvider from '@backend/api/provider/list-provider'
import GetSyncStatusRecieved from '@backend/controller/frontend/providers/sync-status/model/get-sync-status-recieved'

class Props {
    provider!: ListProvider
    id!: string
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

<style scoped>
.status {
    height: 25px;
    width: 50px;
    line-height: 25px;
    margin: 5px 5px 5px 0px;
    text-align-last: center;
}
.provider-status {
    background-color: #4d4b87;
    display: inline-flex;
    margin: 5px;
}
.bad-status {
    color: red;
    font-weight: bold;
    font-size: 16px;
}
.success-status {
    font-size: 16px;
}
.provider-img {
    width: 25px;
    height: 25px;
    margin: 5px 0px;
}
</style>
