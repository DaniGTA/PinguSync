<template>
  <img class="series-image-block" :src="getSeriesImageUrl()" />
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import FrontendSeriesInfos from '../../../backend/controller/objects/transfer/frontend-series-infos';
import ProviderLocalData from '../../../backend/controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import { ImageSize } from '../../../backend/controller/objects/meta/image-size';

@Component
export default class ProviderImageBlock extends Vue {
    @Prop({required: true})
    public series!: FrontendSeriesInfos;

    getSeriesImageUrl(): string{
        const url = '';
        console.log(this.series);
        const providers: ProviderLocalData[] = this.getAllProviders();
        for (const provider of providers) {
            const result = provider.covers?.find(x=> x.size < ImageSize.MEDIUM);
            if(result){
                return result.url;
            }
        }
        return url;
    }
    
    getAllProviders(): ProviderLocalData[] {
        const allProviders = [];
        if(Array.isArray(this.series.infoProviderInfosBinded)){
            allProviders.push(...this.series.infoProviderInfosBinded);
        }else{
            allProviders.push(this.series.infoProviderInfosBinded);
        }

        if(Array.isArray(this.series.listProviderInfosBinded)){
            allProviders.push(...this.series.listProviderInfosBinded);
        }else{
            allProviders.push(this.series.listProviderInfosBinded);
        }
        return allProviders;
    }
}
</script>


<style>
.series-image-block{
    height: 100%;
    width: 100%;
}
</style>