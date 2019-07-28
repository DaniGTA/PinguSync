<template>
  <div v-if="series" class="main-list-entry-content">
    <img :src="series.coverImage" />
    <div class="main-list-entry-content-title">{{getName()}}</div>
    <div v-if="series.seasonNumber">S{{series.seasonNumber}}</div>

    <div v-if="series.canSync">
      <button class="main-list-entry-content-sync-btn" @click="syncAnime()">Sync</button>
    </div>
    <div class="main-list-entry-content-sync-status" v-else>✔</div>

    <div class="main-list-update-progress">
      <button @click="updateWatchProgress(true)" :disabled="watchProgress.episode <= 0">-</button>
      <div v-bind:ref="series.id+'-watchprogress'">{{watchProgress.episode}}</div>/
      <div>{{getEpisode()}}</div>
      <button
        @click="updateWatchProgress(false)"
        :disabled="watchProgress.episode === getEpisode()"
      >+</button>
    </div>

    <hr />
    <div class="main-list-entry-content-actions">
      <div>
        <button class="main-list-entry-content-refresh-btn" @click="updateAnime()">RefreshInfo</button>
      </div>

      <div class="main-list-provider-list">
        <div
          v-for="provider of series.providerInfos"
          v-bind:key="provider.provider + provider.id"
          class="main-list-provider"
        >
          <img
            :src="require('@/assets/'+provider.provider.toLowerCase() + '-logo.png')"
            v-bind:ref="series+'-img'"
            class="main-list-provider-small-list-img"
          />
          <div
            class="main-list-provider-watch-progress"
            v-if="getProviderWatchProgress(provider) != -1"
          >{{getProviderWatchProgress(provider)}}/{{getProviderEpisodesCount(provider)}}</div>
        </div>
      </div>
      <div>
        <button @click="clog(series)">Log object</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, ipcMain } from "electron";
import Anime from "../backend/controller/objects/anime";
import IUpdateList from "../backend/controller/objects/iupdateList";
import { Component, Prop, Vue, PropSync, Watch } from "vue-property-decorator";
import { WorkerTransfer } from "../backend/controller/objects/workerTransfer";
import App from "../App.vue";
import WatchProgress from "../backend/controller/objects/watchProgress";
import { ListProviderLocalData } from "../backend/controller/objects/listProviderLocalData";

@Component
export default class ListEntry extends Vue {
  @PropSync("serie", { type: Anime }) series!: Anime;
  watchProgress: WatchProgress = new WatchProgress(0);
  canSync: boolean = false;
  @Watch("serie", { immediate: true, deep: true })
  async onChildChanged(val: Anime, oldVal: Anime) {
    console.log("ANIME CHANGE");
    try {
      this.watchProgress = await val.getLastWatchProgress();
    } catch (err) {
      console.log(err);
    }
    this.canSync = await val.getCanSyncStatus();
  }
  constructor() {
    super();
    const that = this;
  }

  clog(a: any) {
    console.log(a);
  }
  getObjectAsString(): string {
    return JSON.stringify(this.series);
  }
  async getWatchProgress(): Promise<number> {
    if (this.series) {
      const animeObject = Object.assign(new Anime(), this.series);
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
  updateWatchProgress(reduce: boolean) {
    if (this.series) {
      const div = (this.$refs as any)[
        this.series.id + "-watchprogress"
      ][0] as HTMLElement;
      if (div.textContent != null) {
        App.workerController.send("anime-update-watch-progress", {
          series: this.series,
          reduce
        });
      }
    }
  }

  syncAnime(id: string | number) {
    App.workerController.send("sync-series", id);
  }
  getEpisode(): number | undefined {
    if (this.series) {
      try {
        return Object.assign(new Anime(), this.series).getMaxEpisode();
      } catch (e) {
        return this.series.episodes;
      }
    }
  }

  getName(): string {
    if (this.series) {
      if (this.series.names.engName) {
        return this.series.names.engName;
      } else {
        return this.series.names.romajiName;
      }
    }
    return "loading...";
  }
  updateAnime() {
    App.workerController.send("request-info-refresh", this.series);
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
