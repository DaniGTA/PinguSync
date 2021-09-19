<template>
    <div v-if="loaded && store">
        <div v-for="item of seriesIdList" :key="item.listType">
            <template v-if="true">
                <BlockView :items="[...item.ids]" :title="item.listType" />
            </template>
            <template v-else>
                <SmallList />
            </template>
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'
import SmallList from './list-view/SmallList.vue'
import BlockView from './block-view/BlockList.vue'
import SeriesListViewController from '../../controller/series-list-view-controller'
import { Store, useStore } from '@/store'

@Options({
    components: {
        SmallList,
        BlockView,
    },
})
export default class ListViewSwitcher extends Vue {
    private store?: Store
    private loaded = false
    async mounted(): Promise<void> {
        this.store = useStore()
        const controller = new SeriesListViewController(this.store)
        controller.getSeriesIdsFromCurrentlySelectedListType()
        this.loaded = true
    }

    get seriesIdList() {
        return this.store?.state.seriesList.seriesIdList ?? []
    }
}
</script>
