<i18n>
{
    "en":{
        "search": "Search"
    }
}
</i18n>

<template>
    <div class="list-search">
        <i class="fas fa-search list-search-logo"></i>
        <input class="list-search-input" :placeholder="$t('search')" />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
    components: {}
})
export default class ListSearch extends Vue {

}
</script>

<style>
.list-search{
    display: flex;
    background-color: #1E242D;
    border-left: solid #1E242D 2px;
    width: 300px;
    height: 38px;
    align-items: center;
    margin: 10px;
}

.list-search-logo{
    color: #367BC3;
    margin: 5px;
}

.list-search-input{
    border: none;
    border-bottom: solid #1A1F27 3px;
    background-color: #1E242D;
    font-size: 16px;
    color: white;
    min-width: 250px;
    outline: none;
}
</style>
