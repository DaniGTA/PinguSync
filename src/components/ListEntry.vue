<template>
  <div v-if="seriesPackage" class="main-list-entry-content">
    <img :src="cover" />
  </div>
</template>

<script lang="ts">
import { ipcRenderer, ipcMain } from "electron";
import IUpdateList from "../backend/controller/objects/iupdateList";
import { Component, Prop, Vue, PropSync, Watch } from "vue-property-decorator";
import { WorkerTransfer } from "../backend/controller/objects/workerTransfer";
import App from "../App.vue";
import WatchProgress from "../backend/controller/objects/watchProgress";
import { ListProviderLocalData } from "../backend/controller/objects/listProviderLocalData";
import Series from "../backend/controller/objects/series";
import SeriesPackage from "../backend/controller/objects/seriesPackage";

@Component
export default class ListEntry extends Vue {
  @PropSync("sPackage", { type: SeriesPackage }) seriesPackage!: SeriesPackage;
  watchProgress: WatchProgress = new WatchProgress(0);
  canSync: boolean = false;
  cover: string = "";
  @Watch("sPackage", { immediate: true, deep: true })
  async onChildChanged(val: SeriesPackage, oldVal: SeriesPackage) {
    console.log("ANIME CHANGE");
    this.cover = val.getAnyCoverUrl();
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
    return -1;
  }

  getProviderEpisodesCount(provider: ListProviderLocalData): number {
    if (typeof provider.episodes === "undefined") {
      return -1;
    } else {
      return provider.episodes;
    }
  }

  getProviderWatchProgress(provider: ListProviderLocalData): number {
    provider = Object.assign(new ListProviderLocalData(), provider);
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

  updateAnime(series: Series) {
    App.workerController.send("request-info-refresh", series);
  }
}
</script>

<style>
.main-list-entry-content-title {
  text-align: left;
  font-size: 24px;
  font-weight: bolder;
  display: inline-flex;
}

.main-list-entry-content {
  box-shadow: 0 3px 15px rgba(51, 51, 51, 0.2);
  border-radius: 10px;
  margin: 20px;
  padding: 10px;
  width: 60vw;
  min-width: min-content;
}

.main-list-entry-content-sync-status {
  display: inline;
  float: right;
  color: green;
}

.main-list-entry-content-sync-btn {
  display: inline;
  float: right;
}
.main-list-entry-content-actions {
  display: flex;
}

.main-list-provider-watch-progress {
  display: inline;
  margin-left: 5px;
}
.main-list-provider-small-list-img {
  width: 20px;
}

.main-list-entry-content-refresh-btn {
  border: none;
  margin: 20px 10px 20px 10px;

  text-align: center;
  font-weight: 500;
  padding: 12px 20px 12px 20px;
  border-radius: 3px;
  background-color: #34495e;
  color: white;
  cursor: pointer;
}
.main-list-entry-content-actions {
  height: 75px;
}
.main-list-update-progress {
  display: -webkit-inline-box;
  font-size: larger;
  text-align: center;
  vertical-align: middle;
  align-items: center;
  float: right;
}

.main-list-update-progress > button {
  border: none;
  text-align: center;
  font-weight: 500;
  border-radius: 3px;
  background-color: #34495e;
  color: white;
  cursor: pointer;
}
</style>
