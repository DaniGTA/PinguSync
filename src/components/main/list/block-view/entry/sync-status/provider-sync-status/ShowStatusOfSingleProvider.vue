<template>
    <div>
        <ProviderImageBlock :provider="provider" :showText="false"/>
        <i v-if="isSync" class="fas fa-check"></i>
        <q-skeleton v-else-if="isSync === null" c size="12px" />
        <i v-else class="fas fa-times"></i>
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

    public isSync: boolean | null = null;

    async mounted(): Promise<void> {
       this.isSync = await this.isSynced();
    }

    async isSynced(): Promise<boolean> {
        const result = await ProviderController.isProviderSync({providerName: this.provider.providerName, seriesId: SeriesHoverController.currentlyHoveringSeriesId});
        return result.isSync;
    }
}
</script>

<style>

</style>