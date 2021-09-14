<template>
    <div class="header-provider-list">
        <div v-for="provider in providers" class="header-provider-entry" :key="provider.providerName">
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

<style>
.header-provider-list {
    display: flex;
    justify-content: flex-end;
    height: 100%;
    align-items: center;
    width: 100%;
    cursor: pointer;
}

.header-provider-entry {
    margin: 0px 5px;
}
</style>
