<template>
    <q-page class="list-block-view">
        <ListHeader />
        <ListViewSwitcher />
    </q-page>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'
import ListHeader from './list-header/ListHeader.vue'
import ListViewSwitcher from './ListViewSwitcher.vue'
@Options({
    components: {
        ListHeader,
        ListViewSwitcher,
    },
})
export default class ListBlock extends Vue {}
</script>

<style>
.list-block-view {
    height: 100%;
}
</style>
