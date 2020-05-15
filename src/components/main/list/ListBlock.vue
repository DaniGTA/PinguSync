<template>
<div class="list-block-view">
    <ListHeader />
    <ListViewSwitcher />
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import ListHeader from './list-header/ListHeader.vue';
import ListViewSwitcher from './ListViewSwitcher.vue';
@Component({
    components: {
        ListHeader,
        ListViewSwitcher
    }
})
export default class ListBlock extends Vue {

}
</script>

<style>
.list-block-view{
    height: 100%;
}
</style>
