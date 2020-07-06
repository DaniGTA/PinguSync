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

<style scoped lang="scss">
.list-search{
    display: flex;
    background-color: $primary-background;
    border-left: solid $primary-background 2px;
    width: 300px;
    height: 38px;
    align-items: center;
    margin: 10px;
}

.list-search-logo{
    color: $second-text;
    margin: 5px;
}

.list-search-input{
    border: none;
    border-bottom: solid $primary-background 3px;
    background-color: $primary-background;
    font-size: 16px;
    color: $primary-text;
    min-width: 250px;
    outline: none;
}
</style>
