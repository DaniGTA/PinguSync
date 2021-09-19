<template>
    <div class="list-search">
        <i class="fas fa-search list-search-logo"></i>
        <q-input
            debounce="450"
            v-model="searchText"
            class="list-search-input"
            :placeholder="$t('ListSearch.search')"
            clearable
            input-style="color:white;"
            dense
        />
    </div>
</template>

<script lang="ts">
import { useStore } from '@/store'
import { SearchQuery } from '@backend/controller/frontend/series/model/search-query'
import { Vue, Options } from 'vue-class-component'
import SeriesListViewController from '../../../controller/series-list-view-controller'

@Options({
    components: {},
})
export default class ListSearch extends Vue {
    private searchText: string = ''
    private store = useStore()
    search(): void {
        const searchQuery: SearchQuery = { searchString: this.searchText }
        new SeriesListViewController(this.store).search(searchQuery)
    }
}
</script>
