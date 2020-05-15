<template>
<div class="list-view">
    <template v-if="true">
        <BlockView />
    </template>
    <template v-else>
        <SmallList />
    </template>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import SmallList from './list-view/SmallList.vue';
import BlockView from './block-view/BlockList.vue';

@Component({
    components: {
        SmallList,
        BlockView
    }
})
export default class ListViewSwitcher extends Vue {

}
</script>

<style>
.list-view{
    background: #1E242D;
    margin: 0px 25px;
    height: 100%;
}
</style>
