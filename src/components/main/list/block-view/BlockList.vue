<template>
    <div class="divide-solid divide-y-4 divide-black">
        <div class="flex center ml-2">
            <h2 class="text-3xl font-bold">{{ $t(title + '_LISTTYPE') }}</h2>
        </div>
        <div class="flex flex-wrap center">
            <BlockListEntry v-for="entry in items" :key="entry + 'listentry'" :id="entry"></BlockListEntry>
        </div>
    </div>
</template>

<script lang="ts">
import { ListType } from '@backend/controller/settings/models/provider/list-types'
import { Vue, Options, prop, WithDefault } from 'vue-class-component'
import BlockListEntry from './entry/BlockListEntry.vue'

class Props {
    items: WithDefault<string[]> = prop<string[]>({ default: [] })
    title: WithDefault<ListType> = prop<ListType>({ default: ListType.UNKOWN })
}

@Options({
    components: {
        BlockListEntry,
    },
})
export default class BlockList extends Vue.with(Props) {}
</script>
