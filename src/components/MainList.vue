<template>
  <table style="width:100%">
    <tr>
      <th>EngName</th>
      <th>MainName</th>
      <th>RomanjiName</th>
      <th>Season</th>
      <th>CanSync?</th>
      <th>RefreshInfo</th>
      <th>Provider1</th>
      <th>Provider2</th>
      <th>Provider3</th>
    </tr>
    <tr v-for="item of mainList" v-bind:key="item.id" v-bind:ref="item.id" class="main-list-entry">
      <td>{{item.names.engName}}</td>
      <td>{{item.names.mainName}}</td>
      <td>{{item.names.romajiName}}</td>
      <td>{{item.seasonNumber}}</td>
      <td v-if="item.canSync">
        <button @click="syncAnime(item.id)">Sync</button>
      </td>
      <td v-else>✔</td>

      <td>
        <button @click="updateAnime(item.id)">RefreshInfo</button>
      </td>
      <td>
        <button @click="updateWatchProgress(item,true)" :disabled="getWatchProgress(item) <= 0">-</button>
        <div v-bind:ref="item.id+'-watchprogress'">{{getWatchProgress(item)}}</div>/
        <div>{{getEpisode(item)}}</div>
        <button
          @click="updateWatchProgress(item,false)"
          :disabled="getWatchProgress(item) === getEpisode(item)"
        >+</button>
      </td>
      <td
        v-for="provider of item.providerInfos"
        v-bind:key="provider.provider + provider.id"
      >{{provider.provider}} | {{getProviderWatchProgress(provider)}}/{{getProviderEpisodesCount(provider)}}</td>
    </tr>
  </table>
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
export default class MainList extends Vue {
  static instance: MainList;
  @Prop() mainList: Anime[] = [];
  constructor() {
    super();
    const that = this;
    MainList.instance = this;

    App.workerController.on("series-list", (data: Anime[]) => {
      let x: number = 0;
      that.mainList = [];
      for (const iterator of data) {
        if (that.mainList.findIndex(x => x.id === iterator.id) !== -1) {
          const refs = (this.$refs as any)[iterator.id];
          const entry = refs[0] as HTMLElement;
          entry.style.background = "red";
        } else {
          that.mainList.push(iterator);
          x++;
        }
      }
      console.log("Data size: " + data.length);
      console.log("Showed size: " + x);
    });

    App.workerController.on("update-series-list", (data: any) => {
      console.log(data);
      that.$set(that.mainList, data.targetIndex, data.updatedEntry);
    });
  }

  clog(a: any) {
    console.log(a);
  }
  getObjectAsString(anime: Anime): string {
    return JSON.stringify(anime);
  }
  updateAnime(id: string | number) {
    console.log("updateAnime: " + id);
    var a = this.mainList.findIndex(x => x.id === id);
    App.workerController.send("request-info-refresh", this.mainList[a]);
  }
  getWatchProgress(anime: Anime) {
    const animeObject = Object.assign(new Anime(), anime);
    animeObject.readdFunctions();
    animeObject.getLastWatchProgress().then(number => {
      const div = (this.$refs as any)[
        anime.id + "-watchprogress"
      ][0] as HTMLElement;
      div.textContent = number.episode + "";
    });
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
  updateWatchProgress(anime: Anime, reduce: boolean) {
    const div = (this.$refs as any)[
      anime.id + "-watchprogress"
    ][0] as HTMLElement;
    if (div.textContent != null) {
      App.workerController.send("anime-update-watch-progress", {
        anime,
        reduce
      });
    }
  }

  syncAnime(id: string | number) {
    App.workerController.send("sync-series", id);
  }
  getEpisode(anime: Anime): number | undefined {
    try {
      return Object.assign(new Anime(), anime).getMaxEpisode();
    } catch (e) {
      return anime.episodes;
    }
  }
}
</script>

<style>
.main-list {
  display: flex;
  flex-flow: wrap;
  list-style-type: none;
}
.main-list-entry {
  background: gainsboro;
  padding: 5px;
  margin: 5px;
}
</style>
