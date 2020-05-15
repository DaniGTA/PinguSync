<template>
<div class="list-header">
    <div class="list-header-left">
    </div>
    
    <div class="list-header-right">
        <ListSearch />
        <ListListTypes />
    </div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import ListListTypes from './ListListTypes.vue';
import ListSearch from './ListSearch.vue';
@Component({
    components: {
        ListListTypes,
        ListSearch
    }
})
export default class ListHeader extends Vue {

}
</script>

<style>

.list-header-left{
    height: 100%;
    display: flex;
    align-items: center;
    width: 100%;
}

.list-header-right{
    height: 100%;
    display: flex;
    align-items: center;
    width: 100%;
    place-content: flex-end;
}

.list-header{
    display: flex;
    height: 70px;
    margin: 0px 15px;
}
</style>
