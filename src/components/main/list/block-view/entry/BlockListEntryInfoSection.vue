<template>
    <div v-if="seriesId">
        <SeriesNameBlock :seriesId="seriesId" />
    </div>
</template>

<script lang="ts">
import { Vue, Options, prop, WithDefault } from 'vue-class-component'
import SeriesNameBlock from './../../../../elements/series-elements/SeriesNameBlock.vue'

class Props {
    seriesId: WithDefault<string> = prop<string>({ default: '' })
}

@Options({
    components: {
        SeriesNameBlock,
    },
})
export default class BlockEntry extends Vue.with(Props) {}
</script>
