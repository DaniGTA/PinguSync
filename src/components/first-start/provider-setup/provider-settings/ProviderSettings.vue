<template>
    <div>
        <ProviderListSettings v-on:change:list:type="onListTypeChange" :listSettings="providerLists" />
    </div>
</template>
<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import ListProvider from '../../../../backend/api/provider/list-provider';
import ProviderSyncSettings from './ProviderSyncSettings.vue';
import ListSettings from '../../../../backend/controller/settings/models/provider/list-settings';
import WorkerController from '../../../../backend/communication/ipc-renderer-controller';
import { chOnce } from '../../../../backend/communication/channels';
import ProviderListSettings from './ProviderListSettings.vue';
import { chSend } from '../../../../backend/communication/send-only-channels';
import UpdateUserListType from '../../../../backend/controller/frontend/providers/model/update-user-list-type';

@Component({
    components: {
        ProviderSyncSettings,
        ProviderListSettings
    }
})
export default class ProviderSettings extends Vue {
    public workerController: WorkerController = new WorkerController();

    @Prop()
    provider!: ListProvider;

    providerLists: ListSettings[] = [];

    async mounted(): Promise<void> {
        this.providerLists = await this.workerController.getOnce<ListSettings[]>(chOnce.GetProviderListSettings, this.provider.providerName);
    }
    /** 
     * value wihtout providerName.
    */
    public onListTypeChange(value: UpdateUserListType): void {
        value.providerName = this.provider.providerName;
        this.workerController.send(chSend.UpdateListType, value);
    }
}
</script>
<style>

</style>