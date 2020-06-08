<template>
<div>
    <ProviderImageBlock :provider="provider" :showText="false"/>
    <template v-if="isSync">
        <i class="fas fa-check"></i>
    </template>
    <template v-else>
        <i class="fas fa-times"></i>
    </template>
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

@Component({
	components: {
        ProviderImageBlock
	}
})
export default class ShowStatusOfSingleProvider extends Vue {
    @Prop({required:true})
    provider!: ListProvider;

    isSync!: boolean;

    async mounted(): Promise<void> {
        this.isSync = await this.isSynced();
        console.log('Hovering: '+ SeriesHoverController.currentlyHoveringSeriesId);
    }

    async isSynced(): Promise<boolean>{
        const result = await ProviderController.isProviderSync({providerName: this.provider.providerName, seriesId: SeriesHoverController.currentlyHoveringSeriesId});
        return result.isSync;
    }
}
</script>

<style>

</style>