<template>
    <div class="h-100">
        <ListHeader />
        <ListViewSwitcher />
    </div>
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
