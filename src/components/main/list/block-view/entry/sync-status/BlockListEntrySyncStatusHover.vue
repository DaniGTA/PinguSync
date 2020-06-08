<template>
    <div>
        <ShowStatusOfSingleProvider v-for="provider of providers" :provider="provider" :key="provider"/>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import ListProvider from '../../../../../../backend/api/provider/list-provider';
import ProviderController from '../../../../../controller/provider-controller';
import ShowStatusOfSingleProvider from './provider-sync-status/ShowStatusOfSingleProvider.vue';
import { Prop } from 'vue-property-decorator';
import SeriesHoverController from './../../../../../controller/series-hover-controller';
@Component({
	components: {
        ShowStatusOfSingleProvider
	}
})
export default class BlockListEntrySyncStatusHover extends Vue {
    providers: ListProvider[] = [];
    @Prop({required:true})
    seriesId!: string;
    mounted(): void{
        this.loadProviders();
        console.log('Hover entry: '+this.seriesId);
        SeriesHoverController.currentlyHoveringSeriesId = this.seriesId;
    }

    async loadProviders(): Promise<void>{
        this.providers.push(...await ProviderController.getAllProviderWithConnectedUser());
    }
}
</script>

<style>

</style>
