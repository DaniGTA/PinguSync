<template>
  <div v-intersection="onIntersection">
  <div v-if="episode">
      <img :src="getEpisodeThumbnailUrl()"/>
      <div>
          <div>Episode {{episode[0].episodeNumber}}</div>
          <div v-if="getEpisodeDuration()">{{getEpisodeDuration()}}</div>
      </div>
      <div>{{getEpisodeTitle()}}</div>
  </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import Overview from '../../../backend/controller/objects/meta/overview';
import SeriesListViewController from '../../controller/series-list-view-controller';
import Episode from '../../../backend/controller/objects/meta/episode/episode';
import EpisodeThumbnail from '../../../backend/controller/objects/meta/episode/episode-thumbnail';
import EpisodeTitle from '../../../backend/controller/objects/meta/episode/episode-title';
import EpisodeController from '../../controller/episode-controller';

@Component
export default class SeriesDescriptionBlock extends Vue {
    @Prop({required: true})
    episodeIds!: string[];

    @Prop({required: true})
    seriesId!: string;

    public episode: Episode[] = [];

    private visible = false;

    mounted(): void{
        this.loadEpisodeIds();
    }

    async loadEpisodeIds(): Promise<void> {
        const episodes = [];
        for (const episodeId of this.episodeIds) {
            episodes.push(await EpisodeController.getSingleEpisode(episodeId, this.seriesId));
        }
        this.episode = episodes;
    }

    onIntersection(entry: IntersectionObserverEntry): void {
        this.visible = entry.isIntersecting;
    }    
    isEpisodeNumberSame(): boolean {
         let isAllSameNr: number | string | undefined;
         for (let index = 0; index < this.episode.length; index++) {
             const element = this.episode[index];
             if(isAllSameNr === undefined) {
                 isAllSameNr = element.episodeNumber;
             } else if(isAllSameNr !== element.episodeNumber){
                 return false;
             }
         }
         return true;
    }

    getEpisodeThumbnailUrl(): string {
        const thumbnails: EpisodeThumbnail[] = [];
        for (let index = 0; index < this.episode.length; index++) {
            thumbnails.push(...(this.episode[index].thumbnails ?? []));
        }
        return thumbnails[0].fullLink;
    }

    getEpisodeTitle(): string{
        const titles: EpisodeTitle[] = [];
        for (let index = 0; index < this.episode.length; index++) {
            titles.push(...(this.episode[index].title ?? []));
        }
        return titles[0].text;
    }
    getEpisodeDuration(): number | undefined {
        for (const episode of this.episode) {
            if(episode.duration !== undefined){
                return episode.duration;
            }
        }
        return;
    }
}
</script>

<style>

</style>