<template>
    <div>
        <ProviderListSettings v-on:change:list:type="onListTypeChange" :listSettings="providerLists" />
    </div>
</template>
<script lang="ts">
import { Vue, Options } from 'vue-class-component'
import ProviderSyncSettings from './ProviderSyncSettings.vue'
import ProviderListSettings from './ProviderListSettings.vue'
import ListProvider from '@backend/api/provider/list-provider'
import { chOnce } from '@backend/communication/channels'
import WorkerController from '@backend/communication/ipc-renderer-controller'
import { chSend } from '@backend/communication/send-only-channels'
import UpdateUserListType from '@backend/controller/frontend/providers/model/update-user-list-type'
import ListSettings from '@backend/controller/settings/models/provider/list-settings'

class Props {
    provider!: ListProvider
}

@Options({
    components: {
        ProviderSyncSettings,
        ProviderListSettings,
    },
})
export default class ProviderSettings extends Vue.with(Props) {
    providerLists: ListSettings[] = []

    async mounted(): Promise<void> {
        this.providerLists = await WorkerController.getOnce<ListSettings[]>(
            chOnce.GetProviderListSettings,
            this.provider.providerName
        )
    }
    /**
     * value wihtout providerName.
     */
    public onListTypeChange(value: UpdateUserListType): void {
        value.providerName = this.provider.providerName
        WorkerController.send(chSend.UpdateListType, value)
    }
}
</script>
<style></style>
