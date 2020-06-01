<i18n>
{
    "de": {
        "selected-list": "Ausgewählte Liste"
    },
    "en": {
        "selected-list": "Selected list"
    }
}
</i18n>

<template>
<div class="list-type-choser-container" >
    <q-select 
        label-color="white" 
        class="list-type-choser-select" 
        filled 
        v-model="model" 
        dense="true" 
        :options="getListTypes()" 
        :label="$t('selected-list')"
        @input="changeSelectedListType">

         <template v-slot:selected>
             <div class="list-type-choser-selected">
            {{ model }}
            </div>
        </template>
    </q-select>
</div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { ListType } from '../../../../backend/controller/settings/models/provider/list-types';
import SeriesListViewController from '../../../controller/series-list-view-controller';

@Component({
    components: {}
})
export default class ListTypeChooser extends Vue {
    public listTypeEnum: string[] = Object.keys(ListType).filter(x=> !isNaN(x as any));
    public model = 'ALL';

    public getListTypes(): string[] {
        return this.listTypeEnum.map(x => this.$t(x +'_LISTTYPE').toString());
    }

    public changeSelectedListType(newSelection: string): void {
        const type = this.getListTypes().findIndex(x => x == newSelection);
        SeriesListViewController.selectedListType = this.listTypeEnum[type] as unknown as number;
    }
}
</script>

<style>
.list-type-choser-container{
    background: #1E242D;
    width: 200px;
    height: 38px;
}

.list-type-choser-select{
    width: 200px;
    height: 38px;
}

.list-type-choser-selected{
    color: white;
}
</style>
