<template>
<div class="series-image-block">
    <q-img class="series-image-block" :src="url" transition="fade" @error="onImageError">
        <template v-slot:loading>
            <q-skeleton square width="100%" height="100%" animation="fade" />
        </template>
    </q-img>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import SeriesListViewController from '../../controller/series-list-view-controller';
import { FailedCover } from '../../../backend/controller/frontend/series/model/failed-cover';

@Component
export default class ProviderImageBlock extends Vue {
    @Prop({required: true})
    public seriesId!: string;

    public url = '';

    public mounted(): void {
        this.loadImg();
    }

    private async loadImg(): Promise<void> {
        this.url = await SeriesListViewController.getSeriesCoverUrlById(this.seriesId) ?? '';
    }


    private onImageError(imageUrl: string): void {
        if(imageUrl){
            const failedCover: FailedCover = {seriesId: this.seriesId, coverUrl: imageUrl};
            SeriesListViewController.sendFailedCover(failedCover);
            this.loadImg();
        }else{
            console.error('No image src');
        }
    }
}
</script>


<style>
.series-image-block{
    height: 100%;
    width: 100%;
}

.series-image-block img{
    height: 100%;
    width: 100%;
}
</style>