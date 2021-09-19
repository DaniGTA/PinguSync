<template>
    <div class="inline-block w-48 h-32 bg-gray-50 shadow-md m-4 p-2 rounded" v-if="seriesId && episodeIds">
        <div v-if="episode" class="episode div">
            <div class="no-padding no-margin div-actions">
                <h3 class="">{{ getEpisodeTitle() }}</h3>
            </div>
            <img class="img" :src="imgUrl" />
            <div class="flex justify-between w-100">
                <div
                    class="inline-flex items-center justify-center px-2 py-1 rounded bg-blue-400 m-2 text-xs font-bold text-white"
                >
                    Episode: {{ getEpisodeNumber() }}
                </div>
                <div
                    class="inline-flex items-center justify-center px-2 py-1 rounded bg-blue-400 m-2 text-xs font-bold text-white"
                    v-if="duration"
                >
                    {{ duration }}min
                </div>
            </div>

            <div class="flex">
                <template v-for="e of episode">
                    <div v-if="e.provider" :key="e.id + e.provider" v-on:click="openUrl(e)" class="cursor-pointer m-1">
                        <ProviderImageBlock :provider="{ providerName: e.provider }" :showText="false" />
                    </div>
                </template>
            </div>
        </div>
        <div v-else class="episode"></div>
    </div>
</template>

<script lang="ts">
import Episode from '@backend/controller/objects/meta/episode/episode'
import EpisodeThumbnail from '@backend/controller/objects/meta/episode/episode-thumbnail'
import EpisodeTitle from '@backend/controller/objects/meta/episode/episode-title'
import { Vue, Options, prop, WithDefault } from 'vue-class-component'

import EpisodeController from '../../controller/episode-controller'
import ProviderImageBlock from '../provider-elements/ProviderImageBlock.vue'
import EpisodeMenu from './EpisodeMenu.vue'

class Props {
    episodeIds: WithDefault<string[]> = prop<string[]>({ default: [] })
    seriesId: WithDefault<string> = prop<string>({ default: '' })
}

@Options({
    components: {
        ProviderImageBlock,
        EpisodeMenu,
    },
})
export default class SeriesDescriptionBlock extends Vue.with(Props) {
    public episode: Episode[] | null = null

    public duration: number | null = null
    public imgUrl: string | null = null
    private visible = true

    mounted(): void {
        this.loadEpisodeIds()
    }

    async loadEpisodeIds(): Promise<void> {
        const episodes = []
        for (const episodeId of this.episodeIds) {
            episodes.push(await EpisodeController.getSingleEpisode(episodeId, this.seriesId))
        }
        console.log(episodes)
        this.episode = episodes
        this.duration = this.getEpisodeDuration() ?? null
        this.imgUrl = this.getEpisodeThumbnailUrl() ?? null
    }

    onIntersection(entry: IntersectionObserverEntry): void {
        this.visible = entry.isIntersecting
    }
    isEpisodeNumberSame(): boolean {
        let isAllSameNr: number | string | undefined
        for (const episode of this.episode ?? []) {
            if (isAllSameNr === undefined) {
                isAllSameNr = episode.episodeNumber
            } else if (isAllSameNr !== episode.episodeNumber) {
                return false
            }
        }
        return true
    }

    getEpisodeThumbnailUrl(): string {
        const thumbnails: EpisodeThumbnail[] = []
        for (const episode of this.episode ?? []) {
            thumbnails.push(...(episode?.thumbnails ?? []))
        }
        if (thumbnails.length >= 1) return thumbnails[0].fullLink
        return ''
    }

    getEpisodeNumber(): string {
        return (this.episode ?? [])[0]?.episodeNumber + '' ?? 'undefined'
    }

    getEpisodeTitle(): string {
        const titles: EpisodeTitle[] = []
        for (const episode of this.episode ?? []) {
            titles.push(...(episode?.title ?? []))
        }
        return titles[0]?.text ?? ''
    }
    getEpisodeDuration(): number | undefined {
        for (const episode of this.episode ?? []) {
            if (episode?.duration !== undefined) {
                return episode?.duration
            }
        }
        return
    }

    openUrl(episode: Episode): void {
        console.log('OpenUrl')
        EpisodeController.openEpisodeInExternalBrowser(episode.id, this.seriesId)
    }
}
</script>
