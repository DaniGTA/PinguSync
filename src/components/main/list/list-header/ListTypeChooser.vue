<template>
<div>
    <div v-for="listType in listTypeEnum" :key="listType">
        {{$t(listType+'_LISTTYPE') }}
    </div>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { ListType } from '../../../../backend/controller/settings/models/provider/list-types';

@Component({
    components: {}
})
export default class ListTypeChooser extends Vue {
    listTypeEnum: string[] = Object.keys(ListType).filter(x=> !isNaN(x as any));
}
</script>

<style>
</style>
