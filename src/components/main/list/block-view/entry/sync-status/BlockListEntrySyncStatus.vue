<template>
    <div once transition="scale">
        <i class="fas fa-sync fa-5x sync-symbol"></i>
    </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'
import BlockListEntrySyncStatusHover from './BlockListEntrySyncStatusHover.vue'

class Props {
    seriesId!: string
}

@Options({
    components: {
        BlockListEntrySyncStatusHover,
    },
})
export default class BlockListEntrySyncStatus extends Vue.with(Props) {}
</script>

<style lang="scss" scoped>
.sync-symbol {
    position: absolute;
    z-index: 8;
    margin: -10px -10px;
    left: auto;
    right: 0px;
    color: $third-text;
    font-size: 20px;
    filter: drop-shadow(3px 3px 10px $primary-background);
}
.hover-content {
    background-color: #101317;
    color: $primary-background;
}
</style>
