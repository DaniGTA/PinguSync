<template>
    <div class="m-2 inline-block h-80 relative" v-if="id">
        <div>
            <div class="w-40 h-60" @click="openDetailView()" @mouseover="isHovering()" @mouseleave="isNotHovering()">
                <template v-if="id">
                    <BlockListEntryDetails :seriesId="id" />
                    <div class="absolute top-0" v-if="hover">
                        <BlockListEntrySyncStatusHover @click.prevent :seriesId="id" />
                    </div>
                </template>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Options, prop, WithDefault } from 'vue-class-component'
import BlockListEntryDetails from './BlockListEntryDetails.vue'
import BlockListEntrySyncStatusHover from './sync-status/BlockListEntrySyncStatusHover.vue'
import Intersect from 'vue-intersect'

class Props {
    id: WithDefault<string> = prop<string>({ default: '' })
}

@Options({
    components: {
        BlockListEntrySyncStatusHover,
        BlockListEntryDetails,
        Intersect,
    },
})
export default class BlockEntry extends Vue.with(Props) {
    public visible = false

    private hover = false
    private newHoverStatus = false

    onIntersection(isVisible: boolean): void {
        console.log('test:' + isVisible)
        this.visible = isVisible
    }

    public openDetailView(): void {
        this.$router.push({ name: 'SeriesDetail', params: { id: this.id } })
    }

    public isHovering(): void {
        this.hover = true
        this.newHoverStatus = true
    }

    public async isNotHovering(): Promise<void> {
        this.newHoverStatus = false
        await this.sleep(25)
        this.hover = this.newHoverStatus
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}
</script>
