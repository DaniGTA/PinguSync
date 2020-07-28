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
import Vue from "vue";
import Component from "vue-class-component";
import SeriesListViewController from "../../../controller/series-list-view-controller";
import { getModule } from "vuex-module-decorators";
import { SearchQuery } from "../../../../backend/controller/frontend/series/model/search-query";
import { Watch } from "vue-property-decorator";

const seriesListViewController = getModule(SeriesListViewController);

@Component({
  components: {},
})
export default class ListSearch extends Vue {
  private searchText: string = "";
  @Watch("searchText")
  search(): void {
    const searchQuery: SearchQuery = { searchString: this.searchText };
    seriesListViewController.search(searchQuery);
  }
}
</script>

<style scoped lang="scss">
.list-search {
  display: flex;
  background-color: $primary-background;
  border-left: solid $primary-background 2px;
  min-width: 300px;
  height: 40px;
  align-items: center;
  margin: 10px;
}

.list-search-logo {
  color: $second-text;
  margin: 5px;
}

.list-search-input {
  border: none;
  border-bottom: solid $primary-background 3px;
  background-color: $primary-background;
  font-size: 16px;
  color: $primary-text;
  min-width: 265px;
  outline: none;
  height: inherit;
}

.q-field__native {
  color: white;
}

.list-search-input input {
  color: white;
}
</style>
