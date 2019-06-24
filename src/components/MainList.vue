<template>
  <ul class="main-list">
    <li v-for="item in mainList" v-bind:key="item.mainName + item.engName" class="main-list-entry">
      <div>{{item.names.engName}}</div>
      <div>{{item.names.mainName}}</div>
      <div>{{item.names.romajiName}}</div>
      <small>{{getObjectAsString(item)}}</small>
      <ul class="provide-list">
        <li
          v-for="provider in item.providerInfos"
          v-bind:key="provider.provider + provider.id"
        >{{provider.provider}} |{{provider.watchProgress}}</li>
      </ul>
    </li>
  </ul>
</template>

<script lang="ts">
import { ipcRenderer } from "electron";
import Anime from "../backend/controller/objects/anime";
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
  }
  clog(a: any) {
    console.log(a);
  }
  getObjectAsString(anime: Anime): string {
    return JSON.stringify(anime);
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
