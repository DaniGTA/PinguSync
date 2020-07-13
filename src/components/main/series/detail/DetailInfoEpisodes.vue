<template>
  <div class="episode-list">
      <EpisodeBlock v-for="episodeId of episodeIds" :key="episodeId.length + '-entry'" :episodeIds="episodeId" :seriesId="seriesId"/>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import EpisodeBlock from '../../../elements/episode-elements/EpisodeBlock.vue';
import EpisodeController from '../../../controller/episode-controller';
import { Prop } from 'vue-property-decorator';
import ListProvider from '../../../../backend/api/provider/list-provider';
import ProviderController from '../../../controller/provider-controller';
@Component({
	components: {
        EpisodeBlock
	}
})
export default class DetailInfoEpisodes extends Vue {
    public episodeIds: string[][] = [];
    @Prop({required:true})
    seriesId!: string;
    mounted(): void{
        this.loadEpisodeIds();
    }

    async loadEpisodeIds(): Promise<void> {
        this.episodeIds = await EpisodeController.getEpisodeIdList(this.seriesId) ?? [];
        console.log(this.episodeIds);
    }
}
</script>

<style>
.episode-list{
    text-align: center;
    overflow-x: auto;
}
</style>