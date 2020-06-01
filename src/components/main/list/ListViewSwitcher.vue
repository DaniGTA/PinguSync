<template>
<div class="list-view">
    <div v-for="item of seriesIds" :key="item.listType">
        <template v-if="true">
            <BlockView :items.sync="item.ids" :title="item.listType"/>
        </template>
        <template v-else>
            <SmallList />
        </template>
    </div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import SmallList from './list-view/SmallList.vue';
import BlockView from './block-view/BlockList.vue';
import SeriesListViewController from '../../controller/series-list-view-controller';
import IdListWithName from '../../controller/model/id-list-with-list-type';

@Component({
    components: {
        SmallList,
        BlockView
    }
})
export default class ListViewSwitcher extends Vue {
    public seriesIds: IdListWithName[] = []; 

    async mounted(): Promise<void>{
        SeriesListViewController.listener = (): void => {
            this.loadList();
        };
        await this.loadList(); 
    }

    private async loadList(): Promise<void> {
        this.seriesIds = await SeriesListViewController.getSeriesIdsFromCurrentlySelectedListType();
    }
}
</script>

<style>
.list-view {
    background: #1E242D;
    margin: 0px 25px;
    height: calc(100% - 140px);
    overflow-y: scroll;
}
</style>
