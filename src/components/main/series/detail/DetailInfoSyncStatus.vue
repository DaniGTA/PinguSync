<template>
    <div v-if="seriesId">
        <ShowStatusOfSingleProvider v-for="provider of providers" :provider="provider" :id="seriesId" :key="provider" />
    </div>
</template>

<script lang="ts">
import { Vue, Options, prop, WithDefault } from 'vue-class-component'
import ShowStatusOfSingleProvider from './detail-info-provider-sync-status/ShowStatusOfSingleProvider.vue'
import ProviderController from '../../../controller/provider-controller'
import { ListProviderInterface } from '../../../controller/model/list-provider-interface'

class Props {
    seriesId: WithDefault<string> = prop<string>({ default: '' })
}

@Options({
    components: {
        ShowStatusOfSingleProvider,
    },
})
export default class DetailInfoSyncStatus extends Vue.with(Props) {
    providers: ListProviderInterface[] = []
    mounted(): void {
        void this.loadProviders()
    }

    async loadProviders(): Promise<void> {
        this.providers = await ProviderController.getAllProviderWithConnectedUser()
    }
}
</script>

<style></style>
