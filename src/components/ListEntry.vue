<template>
  <div
    v-if="series && (series.seasonNumber === 1 || !series.seasonNumber)"
    class="main-list-entry-content"
  >
    <div>{{getName()}}</div>
    <div v-if="series.canSync">
      <button @click="syncAnime()">Sync</button>
    </div>
    <div v-else>✔</div>

    <div>
      <button @click="updateAnime(series.id)">RefreshInfo</button>
    </div>
    <div class="main-list-update-progress">
      <button @click="updateWatchProgress(true)" :disabled="getWatchProgress() <= 0">-</button>
      <div v-bind:ref="series.id+'-watchprogress'">{{getWatchProgress()}}</div>/
      <div>{{getEpisode()}}</div>
      <button @click="updateWatchProgress(false)" :disabled="getWatchProgress() === getEpisode()">+</button>
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
  </div>
</template>

<script lang="ts">
import { ipcRenderer, ipcMain } from "electron";
import Anime from "../backend/controller/objects/anime";
import IUpdateList from "../backend/controller/objects/iupdateList";
import { Component, Prop, Vue, PropSync } from "vue-property-decorator";
import { WorkerTransfer } from "../backend/controller/objects/workerTransfer";
import App from "../App.vue";
import { ProviderInfo } from "../backend/controller/objects/providerInfo";

@Component
export default class ListEntry extends Vue {
  @PropSync("serie", { type: Anime }) series!: Anime;

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
  async getWatchProgress() {
    if (this.series) {
      const animeObject = Object.assign(new Anime(), this.series);
      animeObject.readdFunctions();
      try {
        var number = await animeObject.getLastWatchProgress();

        const div = (this.$refs as any)[
          this.series.id + "-watchprogress"
        ][0] as HTMLElement;
        div.textContent = number.episode + "";
      } catch (err) {}
    }
  }

  getProviderEpisodesCount(provider: ProviderInfo): number {
    if (typeof provider.episodes === "undefined") {
      return -1;
    } else {
      return provider.episodes;
    }
  }

  getProviderWatchProgress(provider: ProviderInfo): number {
    provider = Object.assign(new ProviderInfo(), provider);
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
}
</script>

<style>
.main-list-entry {
  box-shadow: 0 3px 15px rgba(51, 51, 51, 0.2);
  border-radius: 10px;
}
</style>
