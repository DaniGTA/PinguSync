<template>
    <q-intersection class="block-list-entry-container" once transition="scale">
        <div
            class="block-list-entry"
            v-intersection="onIntersection"
            @mouseover="isHovering()"
            @mouseleave="isNotHovering()"
            @click="openDetailView()"
        >
            <template v-if="id && visible">
                <BlockListEntryDetails :seriesId="id" />
                <q-popup-proxy
                    @click="isHovering()"
                    @mouseover="isHovering()"
                    @mouseleave="isNotHovering()"
                    anchor="top right"
                    self="top left"
                    content-class="hover-content"
                    v-model="hover"
                    scroll-target="false"
                    :no-parent-event="true"
                    persistent
                    auto-close
                >
                    <BlockListEntrySyncStatusHover @click.prevent :seriesId="id" ref="hoverStatus" />
                </q-popup-proxy>
            </template>
        </div>
    </q-intersection>
</template>

<script lang="ts">
import { Ref, ref } from 'vue'
import { Vue, Options } from 'vue-class-component'
import BlockListEntryDetails from './BlockListEntryDetails.vue'
import BlockListEntrySyncStatusHover from './sync-status/BlockListEntrySyncStatusHover.vue'
class Props {
    id!: string
}

@Options({
    components: {
        BlockListEntrySyncStatusHover,
        BlockListEntryDetails,
    },
})
export default class BlockEntry extends Vue.with(Props) {
    public visible = false

    public hoverStatus: Ref<string | number> = ref<string | number>('hoverStatus')

    private hover = false
    private newHoverStatus = false

    onIntersection(entry: IntersectionObserverEntry): void {
        this.visible = entry.isIntersecting
    }

    public openDetailView(): void {
        this.$router.push({ name: 'SeriesDetail', params: { id: this.id } })
    }

    public isHovering(): void {
        this.hover = true
        this.newHoverStatus = true
    }

    public async isNotHovering(): Promise<void> {
        console.log('not hovering')
        this.newHoverStatus = false
        await this.sleep(25)
        this.hover = this.newHoverStatus
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms))
    }
}
</script>

<style scoped>
.block-list-entry {
    width: 150px;
    height: 285px;
    display: inline-block;
    overflow: hidden;
}
.block-list-entry-container {
    display: inline-block;
    margin: 10px;
}

.block-list-entry-img {
    height: 205px;
    border-radius: 5px;
    overflow: hidden;
}
.hover-content {
    z-index: 10;
}
</style>
