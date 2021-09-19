<template>
    <div class="list-header">
        <div class="list-header-left">
            <ListTypeChooser />
        </div>

        <div class="list-header-right">
            <ListSearch />
            <button color="black" label="Black">Test</button>
            <ListListTypes />
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'
import ListListTypes from './ListListTypes.vue'
import ListSearch from './ListSearch.vue'
import ListTypeChooser from './ListTypeChooser.vue'

@Options({
    components: {
        ListListTypes,
        ListSearch,
        ListTypeChooser,
    },
})
export default class ListHeader extends Vue {}
</script>

<style lang="scss" scoped>
.list-header-left {
    height: 100%;
    display: flex;
    align-items: center;
    width: 100%;
}

.list-header-right {
    height: 100%;
    display: flex;
    align-items: center;
    width: 100%;
    place-content: flex-end;
}

.list-header {
    display: flex;
    height: 70px;
    margin: 0px 15px;
}
</style>
