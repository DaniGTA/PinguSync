<template>
  <div v-if="series.seasonNumber === 1 || !series.seasonNumber" class="main-list-entry-content">
    <td>{{getName()}}</td>
    <td v-if="series.canSync">
      <button @click="syncAnime()">Sync</button>
    </td>
    <td v-else>✔</td>

    <td>
      <button @click="updateAnime(series.id)">RefreshInfo</button>
    </td>
    <td class="main-list-update-progress">
      <button @click="updateWatchProgress(true)" :disabled="getWatchProgress() <= 0">-</button>
      <div v-bind:ref="series.id+'-watchprogress'">{{getWatchProgress()}}</div>/
      <div>{{getEpisode()}}</div>
      <button @click="updateWatchProgress(false)" :disabled="getWatchProgress() === getEpisode()">+</button>
    </td>
    <td class="main-list-provider-list">
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
    </td>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, ipcMain } from "electron";
import Anime from "../backend/controller/objects/anime";
import IUpdateList from "../backend/controller/objects/iupdateList";
import { Component, Prop, Vue } from "vue-property-decorator";
import { WorkerTransfer } from "../backend/controller/objects/workerTransfer";
import App from "../App.vue";
import { ProviderInfo } from "../backend/controller/objects/providerInfo";

@Component
export default class ListEntry extends Vue {
  @Prop() series: Anime = new Anime();

  constructor() {
    super();
    const that = this;
  }
  data() {
    return {
      serie: this.series
    };
  }

  clog(a: any) {
    console.log(a);
  }
  getObjectAsString(): string {
    return JSON.stringify(this.series);
  }
  async getWatchProgress() {
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

  syncAnime(id: string | number) {
    App.workerController.send("sync-series", id);
  }
  getEpisode(): number | undefined {
    try {
      return Object.assign(new Anime(), this.series).getMaxEpisode();
    } catch (e) {
      return this.series.episodes;
    }
  }

  getName(): string {
    if (this.series.names.engName) {
      return this.series.names.engName;
    } else {
      return this.series.names.romajiName;
    }
  }
}
</script>

<style>
</style>
