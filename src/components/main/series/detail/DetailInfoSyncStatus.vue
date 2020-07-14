<template>
  <div>
    <ShowStatusOfSingleProvider v-for="provider of providers" :provider="provider" :id="seriesId" :key="provider"/>

  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import ShowStatusOfSingleProvider from './detail-info-provider-sync-status/ShowStatusOfSingleProvider.vue';
import ProviderController from '../../../controller/provider-controller';
import { Prop } from 'vue-property-decorator';
import { getModule } from 'vuex-module-decorators';
import { ListProviderInterface } from '../../../controller/model/list-provider-interface';

const providerController = getModule(ProviderController);


@Component({
	components: {
        ShowStatusOfSingleProvider
        
	}
})
export default class DetailInfoSyncStatus extends Vue {
    providers: ListProviderInterface[] = [];
    @Prop({required:true})
    seriesId!: string;
    mounted(): void{
        this.loadProviders();
    }

    async loadProviders(): Promise<void>{
        this.providers = await providerController.getAllProviderWithConnectedUser();
    }
}
</script>

<style>

</style>