<template>
  <div v-intersection="onIntersection" class="episode-block">
    <q-card v-if="episode" class="episode">
        <q-img class="img"  :src="imgUrl">
            <EpisodeMenu style="top: 8px; right: 8px; float: right;" />
        </q-img>
        <q-card-section class="row justify-between no-margin title">
            <div class="col col-md-8 text-left">Episode: {{getEpisodeNumber()}}</div>
            <q-badge class="col-3" v-if="duration">{{duration}}min</q-badge>
        </q-card-section>
        <q-card-section class="no-padding no-margin">
            <div class="text-h7">{{getEpisodeTitle()}}</div>
 
        </q-card-section>
        <q-card-actions class="providers">
            <template v-for="e of episode">
                <div v-if="e.provider" :key="e.id+e.provider" v-on:click="openUrl(e)">
                    <q-tooltip>{{e.provider}}</q-tooltip>
                    <ProviderImageBlock :provider="{providerName: e.provider}" :showText="false" :size="20" class="cursor-pointer"/>
                </div>
            </template>
        </q-card-actions>
    </q-card>
    <div v-else class="episode" >
        <q-skeleton class="img" square animation="fade" />
        <div>
            <q-skeleton class="number" animation="fade"  type="text" />
            <q-skeleton class="duration" animation="fade"  type="QBadge" />
        </div>
    </div> 
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import Episode from '../../../backend/controller/objects/meta/episode/episode';
import EpisodeThumbnail from '../../../backend/controller/objects/meta/episode/episode-thumbnail';
import EpisodeTitle from '../../../backend/controller/objects/meta/episode/episode-title';
import EpisodeController from '../../controller/episode-controller';
import ProviderImageBlock from '../provider-elements/ProviderImageBlock.vue';
import EpisodeMenu from './EpisodeMenu.vue';
@Component({
    components: {
        ProviderImageBlock,
        EpisodeMenu
    }
})
export default class SeriesDescriptionBlock extends Vue {
    @Prop({required: true})
    episodeIds!: string[];

    @Prop({required: true})
    seriesId!: string;
    
    public episode: Episode[] | null= null;

    public duration: number | null = null;
    public imgUrl: string | null = null;
    private visible = false;

    created(): void{
        this.loadEpisodeIds();
    }

    async loadEpisodeIds(): Promise<void> {
        const episodes = [];
        for (const episodeId of this.episodeIds) {
            episodes.push(await EpisodeController.getSingleEpisode(episodeId, this.seriesId));
        }
        console.log(episodes);
        this.episode = episodes;
        this.duration = this.getEpisodeDuration() ?? null;
        this.imgUrl = this.getEpisodeThumbnailUrl() ?? null;
    }

    onIntersection(entry: IntersectionObserverEntry): void {
        this.visible = entry.isIntersecting;
    }    
    isEpisodeNumberSame(): boolean {
         let isAllSameNr: number | string | undefined;
         for (const episode of this.episode ?? []) {
             if(isAllSameNr === undefined) {
                 isAllSameNr = episode.episodeNumber;
             } else if(isAllSameNr !== episode.episodeNumber){
                 return false;
             }
         }
         return true;
    }

    getEpisodeThumbnailUrl(): string {
        const thumbnails: EpisodeThumbnail[] = [];
        for (const episode of this.episode ?? []) {
            thumbnails.push(...(episode?.thumbnails ?? []));
        }
        if(thumbnails.length >= 1)
         return thumbnails[0].fullLink;
        return '';
    }

    getEpisodeNumber(): string {
        return (this.episode ?? [])[0]?.episodeNumber+'' ?? 'undefined';
    }

    getEpisodeTitle(): string{
        const titles: EpisodeTitle[] = [];
        for (const episode of this.episode ?? []) {
            titles.push(...(episode?.title ?? []));
        }
        return titles[0]?.text ?? '';
    }
    getEpisodeDuration(): number | undefined {
        for (const episode of this.episode ?? []) {
            if(episode?.duration !== undefined){
                return episode?.duration;
            }
        }
        return;
    }

    openUrl(episode: Episode): void {
        console.log('OpenUrl');
        EpisodeController.openEpisodeInExternalBrowser(episode.id, this.seriesId);
    }
}
</script>

<style scoped lang="scss">
.episode-block{
    display: inline-block;
}

.episode{
    max-width: 225px;
    margin: 5px;
}
.title{
    padding: 5px;
    margin: 0px;
}
.img{
    width: 225px;
    height: 100px;
}
</style>