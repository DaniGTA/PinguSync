<template>
  <div>
    <ShowStatusOfSingleProvider v-for="provider of providers" :provider="provider" :id="seriesId" :key="provider"/>

  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import ShowStatusOfSingleProvider from './detail-info-provider-sync-status/ShowStatusOfSingleProvider.vue';
import ListProvider from '../../../../backend/api/provider/list-provider';
import SeriesHoverController from '../../../controller/series-hover-controller';
import ProviderController from '../../../controller/provider-controller';
import { Prop } from 'vue-property-decorator';
@Component({
	components: {
        ShowStatusOfSingleProvider
        
	}
})
export default class DetailInfoSyncStatus extends Vue {
    providers: ListProvider[] = [];
    @Prop({required:true})
    seriesId!: string;
    mounted(): void{
        this.loadProviders();
    }

    async loadProviders(): Promise<void>{
        this.providers.push(...await ProviderController.getAllProviderWithConnectedUser());
    }
}
</script>

<style>

</style>