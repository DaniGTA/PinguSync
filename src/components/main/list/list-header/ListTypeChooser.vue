<template>
    <div class="list-type-choser-container">
        <select @change="changeSelectedListType">
            <option v-for="listType in getListTypes()" v-bind:key="listType">
                {{ listType }}
            </option>
        </select>
    </div>
</template>

<script lang="ts">
import { useStore } from '@/store'
import { ListType } from '@backend/controller/settings/models/provider/list-types'
import { Vue, Options } from 'vue-class-component'
import SeriesListViewController from '../../../controller/series-list-view-controller'

@Options({
    components: {},
})
export default class ListTypeChooser extends Vue {
    public listTypeEnum: string[] = Object.keys(ListType).filter(x => !isNaN(x as any))
    public model = 'ALL'
    private store = useStore()

    public getListTypes(): string[] {
        return this.listTypeEnum.map(x => this.$t(x + '_LISTTYPE').toString())
    }

    public changeSelectedListType(newSelection: any): void {
        const type = this.getListTypes().findIndex(x => x == newSelection.target.value)
        new SeriesListViewController(this.store).changeListSelection((this.listTypeEnum[type] as unknown) as number)
    }
}
</script>
