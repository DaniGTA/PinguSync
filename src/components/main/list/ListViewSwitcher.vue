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
import { getModule } from 'vuex-module-decorators';
import { Watch } from 'vue-property-decorator';
import { ListType } from '../../../backend/controller/settings/models/provider/list-types';

const seriesListViewController = getModule(SeriesListViewController);


@Component({
    components: {
        SmallList,
        BlockView
    }
})
export default class ListViewSwitcher extends Vue {
    private currentLoadedListType: ListType = ListType.ALL; 
    get seriesIds(): IdListWithName[] {
        return seriesListViewController.ids;
    }
    created(): void {
        seriesListViewController.getSeriesIdsFromCurrentlySelectedListType();
    }

}
</script>

<style lang="scss" scoped>
.list-view {
    background: $primary-background;
    margin: 0px 25px;
    height: calc(100% - 140px);
    overflow-y: scroll;
}
</style>
