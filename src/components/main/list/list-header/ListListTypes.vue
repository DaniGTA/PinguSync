<template>
<div class="list-list-types">
    <div><i class="fas fa-th-large"></i></div>
    <div><i class="fas fa-list"></i></div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
    components: {}
})
export default class ListListTypes extends Vue {

}
</script>

<style>
.list-list-types{
    display: flex;
    background-color: #1E242D;
    color: #367BC3;
    width: 100px;
    height: 38px;
    justify-content: space-evenly;
    font-size: 30px;
    margin: 10px;
}
</style>
