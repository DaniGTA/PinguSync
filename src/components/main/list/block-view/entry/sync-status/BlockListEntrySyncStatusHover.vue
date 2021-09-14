<template>
    <div class="hover" @click.prevent>
        <q-separator />
        <ShowStatusOfSingleProvider
            v-for="provider of providers"
            :provider="provider"
            :key="provider.providerName + 'syncHover'"
        />
    </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'
import ProviderController from '../../../../../controller/provider-controller'
import ShowStatusOfSingleProvider from './provider-sync-status/ShowStatusOfSingleProvider.vue'
import SeriesHoverController from './../../../../../controller/series-hover-controller'
import { ListProviderInterface } from '../../../../../controller/model/list-provider-interface'

class Props {
    seriesId!: string
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
        console.log('Hover entry: ' + this.seriesId)
        SeriesHoverController.currentlyHoveringSeriesId = this.seriesId
    }

    async loadProviders(): Promise<void> {
        console.log('Providers loaded')
        this.providers = await ProviderController.getAllProviderWithConnectedUser()
    }
}
</script>

<style scoped>
.hover {
    height: 205px;
    display: flex;
    margin: 15px;
    z-index: 10;
}
</style>
