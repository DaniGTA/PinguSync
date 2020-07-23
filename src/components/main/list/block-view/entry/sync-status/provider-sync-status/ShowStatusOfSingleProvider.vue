<template>
    <div class="col provider-status">
        <ProviderImageBlock class="row" :provider="provider" :showText="false"/>
        <div class="row justify-center status">
            <i v-if="isSync()" color="green" class="fas fa-check"></i>
            <q-skeleton v-else-if="result === null" c size="12px" />
            <div class="bad-status" v-if="!isSync() && result !== null">
                {{result.syncedEpisodeCount}}/{{result.maxEpisodeNumber}}
            </div>
        </div>
        <q-btn push color="black" text-color="white" @click="sync">Sync</q-btn>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import ProviderImageBlock from './../../../../../../elements/provider-elements/ProviderImageBlock.vue';
import { Prop } from 'vue-property-decorator';
import ProviderController from '../../../../../../controller/provider-controller';
import SeriesHoverController from './../../../../../../controller/series-hover-controller';
import GetSyncStatusRecieved from '../../../../../../../backend/controller/frontend/providers/sync-status/model/get-sync-status-recieved';
import { getModule } from 'vuex-module-decorators';
import { ListProviderInterface } from '../../../../../../controller/model/list-provider-interface';
const providerController = getModule(ProviderController);
const seriesHoverController = getModule(SeriesHoverController);

@Component({
	components: {
        ProviderImageBlock
	}
})
export default class ShowStatusOfSingleProvider extends Vue {
    @Prop({required:true})
    provider!: ListProviderInterface;

    public result: GetSyncStatusRecieved | null = null;

    async created(): Promise<void> {
        await this.delay(500);
        this.result = await this.isSynced();
    }

    async isSynced(): Promise<GetSyncStatusRecieved> {
        return await providerController.isProviderSync({providerName: this.provider.providerName, seriesId: this.getSeriesId()});
    }

    sync(): void{
        providerController.syncAllEpisodes(this.provider.providerName, this.getSeriesId());
    }

    private getSeriesId(): string{
        return seriesHoverController.currentlyHoveringSeriesId;
    }

    isSync(): boolean{
        return this?.result?.isSync ?? false;
    }

    delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    }
}
</script>

<style scoped>
.status{
    height: 20px;
}
.provider-status{
    margin: 5px;
}
.bad-status{
    color: red;
    font-weight: bold;
}
</style>