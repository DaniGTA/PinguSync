<template>
  <div v-intersection="onIntersection" class="episode-block">
    <div v-if="episode" class="episode">
        <div class="img"><img v-if="imgUrl" :src="imgUrl"/></div>
        <div>
            <div class="number">Episode: {{getEpisodeNumber()}}</div>
            <q-badge class="duration" v-if="duration">{{duration}}min</q-badge>
        </div>
        <div>{{getEpisodeTitle()}}</div>
        <div class="providers">
            <div v-for="e of episode" :key="e.provider + e.id">
                <q-tooltip>{{e.provider}}</q-tooltip>
                <ProviderImageBlock :provider="{providerName: e.provider}" :showText="false" :size="20" @click=""/>
            </div>
        </div>
    </div>
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
import Overview from '../../../backend/controller/objects/meta/overview';
import SeriesListViewController from '../../controller/series-list-view-controller';
import Episode from '../../../backend/controller/objects/meta/episode/episode';
import EpisodeThumbnail from '../../../backend/controller/objects/meta/episode/episode-thumbnail';
import EpisodeTitle from '../../../backend/controller/objects/meta/episode/episode-title';
import EpisodeController from '../../controller/episode-controller';
import ProviderImageBlock from '../provider-elements/ProviderImageBlock.vue';
@Component({
    components: {
        ProviderImageBlock
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
}
</script>

<style scoped lang="scss">
$width: 200px;
$widthSpace: 10px;
$height: 100px;
$textHeight: 40px;

.episode-block {
    display: inline-block;
    background-color: #1E242D;
    margin: $widthSpace/2;
}

.episode{
    color: white;
    width: $width + $widthSpace;
    height: $height + $textHeight + 10px;
    position: relative;
}
.img{
    background-color: white;
    width: $width;
    height: $height;
    margin: 5px $widthSpace/2;
}
.duration{
    position: absolute;
    right: $widthSpace/2;
    bottom: $textHeight - 10px;
}
.number{
    margin-left: $widthSpace/2;
}
.providers{
    display: flex;
    position: absolute;
    bottom: 5;
    right: $widthSpace/2;
}
</style>