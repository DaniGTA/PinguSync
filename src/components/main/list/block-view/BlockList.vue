<template>
    <div class="block-list">
        <div class="block-list-title-box">
            <div class="block-list-title">{{ $t(title + '_LISTTYPE') }}</div>
            <q-separator class="block-list-title-line" />
        </div>
        <BlockListEntry v-for="entry in syncedItems" :key="entry + 'listentry'" :id="entry"></BlockListEntry>
    </div>
</template>

<script lang="ts">
import { ListType } from '@backend/controller/settings/models/provider/list-types'
import { Vue, Options } from 'vue-class-component'
import BlockListEntry from './entry/BlockListEntry.vue'

class Props {
    syncedItems!: string[]
    title!: ListType
}

@Options({
    components: {
        BlockListEntry,
    },
})
export default class BlockList extends Vue.with(Props) {}
</script>

<style lang="scss" scoped>
.block-list {
}

.block-list-title-box {
    display: flex;
    align-items: center;
}

.block-list-title-line {
    background: $primary-text;
    margin: 0px 5px;
    width: auto;
}

.list-line {
    text-align: center;
}
.block-list-title {
    color: $primary-text;
    margin: 0px 10px;
    display: inline;
    font-size: 28px;
}
</style>
