<template>
  <div>
    <div class="modal-mask">
      <div class="modal-wrapper">
        <div class="modal-container">
          <button @click="close()">Close</button>
          Local Data Size{{localData.length}}
          <template
            v-for="pool of series.episodeBindingPools"
          >
            <table style="width:100%">
              <tr>
                <th>Provider</th>
                <th>Provider ID</th>
                <th>Episode Number</th>
                <th>Season Number</th>
              </tr>
              <template v-for="mapping of pool.bindedEpisodeMappings">
                <tr v-bind:key="mapping.id">
                  <td>{{mapping.provider}}</td>
                  <td>{{mapping.providerSeriesId}}</td>
                  <td>{{mapping.episodeNumber}}</td>
                  <td>{{mapping.season}}</td>
                </tr>
              </template>
            </table>
          </template>
        </div>
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
import { ListProviderLocalData } from "../backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data";
import ProviderLocalData from "../backend/controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data";
Vue.component("Promised", Promised);
Vue.use(VueLazyload);

@Component
export default class ListEntry extends Vue {
  @PropSync("sSeries", { type: Series }) public series!: Series | null;
  @Watch("sSeries", { immediate: true, deep: true })
  public onChildChanged(val: Series, oldVal: Series) {
    if (val) {
      this.localData = val.getAllProviderLocalDatas();
    }
  }
  public localData: ProviderLocalData[] = [];
  public constructor() {
    super();
  }
  public close() {
    this.series = null;
  }
}
</script>

<style>
.modal-mask {
  height: 100%;
  overflow: scroll;
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
  font-family: Helvetica, Arial, sans-serif;
  overflow: scroll;
  height: 80%;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
}

.modal-default-button {
  float: right;
}

/*
 * The following styles are auto-applied to elements with
 * transition="modal" when their visibility is toggled
 * by Vue.js.
 *
 * You can easily play with the modal transition by editing
 * these styles.
 */

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}
</style>
