<template>
  <div v-if="seriesPackage" class="main-list-entry-content">
    <div>{{name}}</div>
    <img v-lazy.container="cover" class="series-cover" />
    <button @click="clog(seriesPackage)">Log</button>
    <button @click="seriesDataRefresh(seriesPackage)">Data Refresh</button>
    <button @click="seriesDataRefresh(seriesPackage)">Delete Package</button>

    <div v-for="item of seriesPackage.allRelations" v-bind:key="item.id">
      <button @click="logNames(item)">Log names</button>
      <Promised
        :promise="getSeason(item)"
        v-slot:combined="{ isPending, isDelayOver, data, error }"
      >Season: {{ data }}</Promised>
      <Promised
        :promise="canSync(item)"
        v-slot:combined="{ isPending, isDelayOver, data, error }"
      >{{ data }}</Promised>
      <div
        v-for="listProvider of item.listProviderInfos"
        v-bind:key="listProvider.provider+item.id"
      >
        {{listProvider.provider}}
        {{getProviderWatchProgress(listProvider)}}
        /
        {{getProviderEpisodesCount(listProvider)}}
      </div>
    </div>
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
  @PropSync("sPackage", { type: SeriesPackage }) seriesPackage!: SeriesPackage;
  watchProgress: WatchProgress = new WatchProgress(0);
  cover: string = "";
  name: string = "?";
  @Watch("sPackage", { immediate: true, deep: true })
  async onChildChanged(val: SeriesPackage, oldVal: SeriesPackage) {
    console.log("ANIME CHANGE");
    this.cover = val.getAnyCoverUrl();
    this.name = await val.getPreferedName();
    try {
      // this.watchProgress = await val.getLastWatchProgress();
    } catch (err) {
      console.log(err);
    }
    // this.canSync = await val.getCanSyncStatus();
  }
  constructor() {
    super();
    const that = this;
  }

  clog(a: any) {
    console.log(a);
  }

  logNames(item: Series) {
    const animeObject = Object.assign(new Series(), item);
    animeObject.readdFunctions();
    console.log(animeObject.getAllNames());
  }

  getObjectAsString(series: Series): string {
    return JSON.stringify(series);
  }
  async getWatchProgress(series: Series): Promise<number> {
    if (series) {
      const animeObject = Object.assign(new Series(), series);
      animeObject.readdFunctions();
      try {
        var number = await animeObject.getLastWatchProgress();
        return number.episode;
      } catch (err) {}
    }
    return 0;
  }

  getProviderEpisodesCount(provider: ListProviderLocalData): number {
    if (typeof provider.episodes === "undefined") {
      return -1;
    } else {
      return provider.episodes;
    }
  }

  removeSeriesPackage(seriesPackage: SeriesPackage): void {
    App.workerController.send("delete-series-package", seriesPackage.id);
  }

  getProviderWatchProgress(provider: ListProviderLocalData): number {
    provider = Object.assign(new ListProviderLocalData(provider.id), provider);
    const result = provider.getHighestWatchedEpisode();
    if (typeof result === "undefined") {
      return -1;
    } else {
      return result.episode;
    }
  }
  /**
   *
   */
  updateWatchProgress(series: Series, reduce: boolean) {
    if (series) {
      const div = (this.$refs as any)[
        series.id + "-watchprogress"
      ][0] as HTMLElement;
      if (div.textContent != null) {
        App.workerController.send("anime-update-watch-progress", {
          series: series,
          reduce
        });
      }
    }
  }

  syncAnime(id: string | number) {
    App.workerController.send("sync-series", id);
  }

  /**
   * Collect information about the series.
   */
  seriesDataRefresh(seriesPackage: SeriesPackage) {
    App.workerController.send("request-info-refresh", seriesPackage.id);
  }

  async getSeason(series: Series): Promise<number | undefined> {
    series = Object.assign(new Series(), series);
    return (await series.getSeason(SeasonSearchMode.NO_SEARCH, []))
      .seasonNumber;
  }
  async canSync(series: Series): Promise<boolean> {
    series = Object.assign(new Series(), series);
    return series.getCanSync();
  }
}
</script>

<style>
* {
  color: white;
}
.main-list-entry-content-title {
  text-align: left;
  font-size: 24px;
  font-weight: bolder;
  display: inline-flex;
}

.main-list-entry-content {
  margin: 20px;
}

.series-cover {
  height: 15vh;
}
</style>
