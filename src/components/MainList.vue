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
    <tr v-for="item in mainList" v-bind:key="item.id" class="main-list-entry">
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
      <td
        v-for="provider in item.providerInfos"
        v-bind:key="provider.provider + provider.id"
      >{{provider.provider}} | {{provider.watchProgress}}</td>
    </tr>
  </table>
</template>

<script lang="ts">
import { ipcRenderer, ipcMain } from "electron";
import Anime from "../backend/controller/objects/anime";
import IUpdateList from "../backend/controller/objects/iupdateList";
import { Component, Prop, Vue } from "vue-property-decorator";
import WorkerController from "../backend/controller/workerController";
import { WorkerTransfer } from "../backend/controller/objects/workerTransfer";
import App from "../App.vue";
@Component
export default class MainList extends Vue {
  static instance: MainList;
  @Prop() mainList: Anime[] = [];
  constructor() {
    super();
    const that = this;
    MainList.instance = this;

    App.workerController.on("series-list", (data: Anime[]) => {
      that.mainList.push(...data);
    });

    App.workerController.on("update-series-list", (data: any) => {
      console.log(data.data);
      that.$set(that.mainList, data.targetIndex, data.updatedEntry);
    });

    App.workerController.worker.addEventListener(
      "message",
      (ev: MessageEvent) => {
        const data = ev.data as WorkerTransfer;
        console.log(ev);
      }
    );
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

  syncAnime(id: string | number) {
    App.workerController.send("sync-series", id);
  }
}
</script>

<style>
.provider-list {
  display: inline;
  list-style-type: none;
}
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
