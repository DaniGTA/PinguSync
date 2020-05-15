<template>
    <div>
        <div>
            Dieser Provider werden
        </div>
        <div>
            <div v-for="singleProvider in allProvidersThatWillBeSyncedWithThis" :key="singleProvider.providerName">
                <ProviderImageBlock :provider="singleProvider"/>
            </div>
        </div>
        <div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import ListProvider from '../../../../backend/api/provider/list-provider';
import WorkerController from '../../../../backend/communication/ipc-renderer-controller';
import AddSyncProvidersModel from '../../../../backend/controller/frontend/providers/model/add-sync-providers-model';
import { chOnce } from '../../../../backend/communication/channels';
import ProviderImageBlock from '../../../elements/provider-elements/ProviderImageBlock.vue';

@Component({
    components: {
        ProviderImageBlock,
    }
})
export default class ProviderSyncSettings extends Vue {
    public workerController: WorkerController = new WorkerController();


    @Prop()
    provider!: ListProvider;

    allProvidersThatWillBeSyncedWithThis: ListProvider[] = [{providerName: 'Trakt'} as ListProvider, {providerName: 'Trakt'} as ListProvider];


    async getAllProviderThatWillBeSynced(): Promise<ListProvider[]>{
        return await this.workerController.getOnce<ListProvider[]>(chOnce.GetSyncProviderSettings, this.provider.providerName);
    }

    addProviderToSync(): void{
        const data: AddSyncProvidersModel = {
            providerName: this.provider.providerName,
            providerNameThatWillBeAddedToSync: ''
        };
        this.workerController.send('add-sync-with-provider', data);
    }
}
</script>

<style>

</style>