<template>
    <div>
        <ProviderImageBlock :provider="provider" :showText="false"/>
        <i v-if="result && result.isSync" class="fas fa-check"></i>
        <q-skeleton v-else-if="!result && result.isSync === null" c size="12px" />
        <i v-else class="fas fa-times"></i>
        <div v-if="result">
        {{result.syncedEpisodeCount}}/{{result.maxEpisodeNumber}}
        </div>
        <q-btn text-color="white" @click="sync">Sync</q-btn>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import ProviderImageBlock from './../../../../../../elements/provider-elements/ProviderImageBlock.vue';
import ListProvider from '../../../../../../../backend/api/provider/list-provider';
import { Prop } from 'vue-property-decorator';
import ProviderController from '../../../../../../controller/provider-controller';
import SeriesHoverController from './../../../../../../controller/series-hover-controller';
import GetSyncStatusRecieved from '../../../../../../../backend/controller/frontend/providers/sync-status/model/get-sync-status-recieved';

@Component({
	components: {
        ProviderImageBlock
	}
})
export default class ShowStatusOfSingleProvider extends Vue {
    @Prop({required:true})
    provider!: ListProvider;

    public result: GetSyncStatusRecieved | null = null;

    mounted(): void {
       this.isSynced().then(x =>{
           this.result = x;
       });
    }

    async isSynced(): Promise<GetSyncStatusRecieved> {
        return await ProviderController.isProviderSync({providerName: this.provider.providerName, seriesId: this.getSeriesId()});
    }

    sync(): void{
        ProviderController.syncAllEpisodes(this.provider.providerName, this.getSeriesId());
    }

    private getSeriesId(): string{
        return SeriesHoverController.currentlyHoveringSeriesId;
    }
}
</script>

<style>

</style>