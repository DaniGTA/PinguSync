<template>
    <div class="flex w-full h-full flex-row-reverse">
        <div v-for="provider in providers" class="m-2 h-full" :key="provider.providerName">
            <ProviderEntry :provider="provider" />
        </div>
    </div>
</template>

<script lang="ts">
import { ListProviderInterface } from '@/components/controller/model/list-provider-interface'
import { Vue, Options } from 'vue-class-component'
import ProviderController from '../../../controller/provider-controller'
import ProviderEntry from './ProviderEntry.vue'

@Options({
    components: {
        ProviderEntry,
    },
})
export default class ProviderList extends Vue {
    isLoginDialogOpen = false
    providers: ListProviderInterface[] = []

    mounted(): void {
        this.loadProviders()
    }

    async loadProviders(): Promise<void> {
        this.providers = await ProviderController.getAllAvaibleProviders()
    }
}
</script>
