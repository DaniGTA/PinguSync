<template>
    <div class="bg-gray-800 flex" @click.prevent>
        <ShowStatusOfSingleProvider
            v-for="provider of providers"
            :provider="provider"
            :seriesId="seriesId"
            :key="provider.providerName + 'syncHover'"
        />
    </div>
</template>

<script lang="ts">
import { Vue, Options, prop, WithDefault } from 'vue-class-component'
import ProviderController from '../../../../../controller/provider-controller'
import ShowStatusOfSingleProvider from './provider-sync-status/ShowStatusOfSingleProvider.vue'
import { ListProviderInterface } from '../../../../../controller/model/list-provider-interface'

class Props {
    seriesId: WithDefault<string> = prop<string>({ default: '' })
}

@Options({
    components: {
        ShowStatusOfSingleProvider,
    },
    methods: {
        destroyed: () => {
            console.error('ALARM COMPONENT FÄLLT')
        },
    },
})
export default class BlockListEntrySyncStatusHover extends Vue.with(Props) {
    providers: ListProviderInterface[] = []

    created(): void {
        this.loadProviders()
    }

    async loadProviders(): Promise<void> {
        console.log('Providers loaded')
        this.providers = await ProviderController.getAllProviderWithConnectedUser()
    }
}
</script>
