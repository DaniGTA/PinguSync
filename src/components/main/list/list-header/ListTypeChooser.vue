<template>
<div class="list-type-chosser-list" >
    <q-select filled v-model="model" :options="getListTypes()" label="outlined" outlined />
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

    public getListTypes(): string[] {
        return this.listTypeEnum.map(x=> this.$t(x +'_LISTTYPE').toString());
    }
}
</script>

<style>
.list-type-chosser-list{

}

.list-type-chosser-entry{
    display: inline-block;
    background: #1E242D;
    color: white;
    font-weight: bolder;
    margin: 5px;
    padding: 5px;
    font-size: 10px;
    border-left: black solid 2px;
}
</style>
