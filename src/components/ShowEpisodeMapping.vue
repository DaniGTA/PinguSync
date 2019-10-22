<template>
  <div>

  </div>
</template>

<script lang="ts">
import { ipcRenderer, ipcMain } from "electron";
import { Component, Prop, Vue, PropSync, Watch } from "vue-property-decorator";
import App from "../App.vue";

import Series from "../backend/controller/objects/series";
import VueLazyload from "vue-lazyload";
import { Promised } from "vue-promised";
import SeriesPackage from "../backend/controller/objects/series-package";
import WatchProgress from "../backend/controller/objects/meta/watch-progress";
import { SeasonSearchMode } from "../backend/helpFunctions/season-helper/season-search-mode";
import { ListProviderLocalData } from "../backend/controller/provider-manager/local-data/list-provider-local-data";
Vue.component("Promised", Promised);
Vue.use(VueLazyload);

@Component
export default class ListEntry extends Vue {

}
</script>

<style>

</style>
