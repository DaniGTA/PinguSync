<template>
    <div class="header-provider-list">
        <div v-for="provider in providers" class="header-provider-entry" :key="provider.providerName">
            <ProviderEntry :provider="provider" />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import ProviderController from '../../../controller/provider-controller'
import ProviderEntry from './ProviderEntry.vue'
import { getModule } from 'vuex-module-decorators'
import { ListProviderInterface } from '../../../controller/model/list-provider-interface'
const providerController = getModule(ProviderController)

@Component({
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
        this.providers = await providerController.getAllAvaibleProviders()
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
