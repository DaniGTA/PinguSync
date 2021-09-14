<template>
    <div class="block-list-entry-info-section">
        <SeriesNameBlock :seriesId="seriesId" />
    </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'
import SeriesNameBlock from './../../../../elements/series-elements/SeriesNameBlock.vue'

class Props {
    seriesId!: string
}

@Options({
    components: {
        SeriesNameBlock,
    },
})
export default class BlockEntry extends Vue.with(Props) {}
</script>
<style>
.block-list-entry-info-section {
}
</style>
