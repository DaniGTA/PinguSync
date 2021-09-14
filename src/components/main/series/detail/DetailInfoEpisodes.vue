<template>
    <div class="episode-list">
        <EpisodeBlock
            v-for="episodeId of episodeIds"
            :key="episodeId.length + '-entry'"
            :episodeIds="episodeId"
            :seriesId="seriesId"
        />
    </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'
import EpisodeBlock from '../../../elements/episode-elements/EpisodeBlock.vue'
import EpisodeController from '../../../controller/episode-controller'

class Props {
    seriesId!: string
}

@Options({
    components: {
        EpisodeBlock,
    },
})
export default class DetailInfoEpisodes extends Vue.with(Props) {
    public episodeIds: string[][] = []
    mounted(): void {
        void this.loadEpisodeIds()
    }

    async loadEpisodeIds(): Promise<void> {
        this.episodeIds = (await EpisodeController.getEpisodeIdList(this.seriesId)) ?? []
        console.log(this.episodeIds)
    }
}
</script>

<style>
.episode-list {
    text-align: center;
    overflow-x: auto;
}
</style>
