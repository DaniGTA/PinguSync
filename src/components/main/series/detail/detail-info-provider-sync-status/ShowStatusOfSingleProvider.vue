<template>
    <div class="row provider-status">
        <ProviderImageBlock class="col provider-img" :provider="provider" :showText="false" size="25"/>
        <div class="col justify-center status">
            <i v-if="result && result.isSync" color="green" class="fas fa-check success-status"></i>
            <q-skeleton v-else-if="!result && result.isSync === null" c size="16px" />
            <div class="bad-status" v-if="result && !result.isSync">
                {{result.syncedEpisodeCount}}/{{result.maxEpisodeNumber}}
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import ProviderImageBlock from './../../../../elements/provider-elements/ProviderImageBlock.vue';
import { Prop } from 'vue-property-decorator';
import GetSyncStatusRecieved from '../../../../../backend/controller/frontend/providers/sync-status/model/get-sync-status-recieved';
import ListProvider from '../../../../../backend/api/provider/list-provider';
import ProviderController from '../../../../controller/provider-controller';
import { getModule } from 'vuex-module-decorators';
const providerController = getModule(ProviderController);

@Component({
	components: {
        ProviderImageBlock
	}
})
export default class ShowStatusOfSingleProvider extends Vue {
    @Prop({required: true})
    public provider!: ListProvider;
    @Prop({required: true})
    public id!: string;
    public result: GetSyncStatusRecieved | null = null;

    mounted(): void {
       this.isSynced().then(x =>{
           console.log(x);
           this.result = x;
       });
    }

    async isSynced(): Promise<GetSyncStatusRecieved> {
        return await providerController.isProviderSync({providerName: this.provider.providerName, seriesId: this.id});
    }

    sync(): void{
        providerController.syncAllEpisodes({providerName: this.provider.providerName, seriesId: this.id});
    }
}
</script>

<style scoped>
.status{
    height: 25px;
    width: 50px;
    line-height: 25px;
    margin: 5px 5px 5px 0px;
    text-align-last: center;
}
.provider-status{
    background-color: #4D4B87;
    display: inline-flex;
    margin: 5px;
}
.bad-status{
    color: red;
    font-weight: bold;
    font-size: 16px;
}
.success-status{
    font-size: 16px;
}
.provider-img{
    width: 25px;
    height: 25px;
    margin: 5px 0px;
}
</style>