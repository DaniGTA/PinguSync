<template>
  <table style="width:100%">
    <tr>
      <th>EngName</th>
      <th>MainName</th>
      <th>RomanjiName</th>
      <th>Season</th>
      <th>Sync</th>
      <th>Provider1</th>
      <th>Provider2</th>
      <th>Provider3</th>
    </tr>
    <tr v-for="item in mainList" v-bind:key="item.id" class="main-list-entry">
      <td>{{item.names.engName}}</td>
      <td>{{item.names.mainName}}</td>
      <td>{{item.names.romajiName}}</td>
      <td>{{item.seasonNumber}}</td>
      <td>{{item.canSync}}</td>

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
@Component
export default class Providers extends Vue {
  @Prop() mainList: Anime[] = [];
  constructor() {
    super();
    const that = this;
    ipcRenderer.on("series-list", (event: any, list: Anime[]) => {
      console.log(list);
      that.mainList.push(...list);
    });

    ipcRenderer.on("update-series-list", (event: any, update: IUpdateList) => {
      console.log(update);
      that.$set(that.mainList, update.targetIndex, update.updatedEntry);
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
    ipcRenderer.send("request-info-refresh", this.mainList[a]);
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
