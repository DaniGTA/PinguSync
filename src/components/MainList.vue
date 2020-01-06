<template>
  <div>
    <nav class="nav">
      <a href="#" class="nav-item is-active" active-color="orange">Home</a>
      <a href="#" class="nav-item" active-color="green">About</a>
      <a href="#" class="nav-item" active-color="blue">Testimonials</a>
      <a href="#" class="nav-item" active-color="red">Blog</a>
      <a href="#" class="nav-item" active-color="rebeccapurple">Contact</a>
      <span class="nav-indicator"></span>
    </nav>
    <div class="main-list">
      <ListEntry
        v-for="item of mainList"
        v-bind:key="item.id"
        v-bind:ref="item.id"
        :sPackage.sync="item"
      ></ListEntry>
    </div>
  </div>
</template>

<script lang="ts">
import { ipcRenderer, ipcMain } from 'electron';
import { Component, Prop, Vue } from 'vue-property-decorator';

import App from "../App.vue";
import ListEntry from "./ListEntry.vue";

import Series from "../backend/controller/objects/series";
import SeriesPackage from '../backend/controller/objects/series-package';
import IUpdateList from '../backend/controller/objects/update-list';

@Component({
  components: {
    ListEntry
  }
})
export default class MainList extends Vue {
  public static instance: MainList;
  @Prop() public sortedList: SeriesPackage[] = [];
  @Prop() public mainList: SeriesPackage[] = [];

  constructor() {
    super();
    const that = this;
    MainList.instance = this;
    App.workerController.on("series-list", async (data: SeriesPackage[]) => {
      let x: number = 0;
      that.mainList = [];
      console.log(data);
      for (let entry of data) {
        try {
          if (that.mainList.findIndex(x => x.id === entry.id) === -1) {
            entry = Object.assign(new SeriesPackage(), entry);
            that.mainList.push(entry);

            x++;
          }
        } catch (err) {}
      }

      console.log("Data size: " + data.length);
      console.log("Showed size: " + x);
    });

    App.workerController.on("update-series-list", (data: IUpdateList) => {
      console.log(data);
      that.$set(
        that.mainList,
        data.targetIndex,
        Object.assign(new SeriesPackage(), data.updatedEntry)
      );
    });

    App.workerController.on("series-list-remove-entry", (data: number) => {
      console.log("Remove entry: " + data);
      that.$delete(that.mainList, data);
    });
  }

  public clog(a: any) {
    console.log(a);
  }


}
</script>

<style>
.main-list {
  width: 100%;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  align-content: center;
}
.main-list-provider {
  background-color: #f2f2f2;
  padding: 5px;
}
@import url("https://fonts.googleapis.com/css?family=DM+Sans:500,700&display=swap");

* {
  box-sizing: border-box;
}

.nav-item {
  color: #83818c;
  padding: 20px;
  text-decoration: none;
  transition: 0.3s;
  margin: 0 6px;
  z-index: 1;
  font-family: "DM Sans", sans-serif;
  font-weight: 500;
  position: relative;
}
.nav-item:before {
  content: "";
  position: absolute;
  bottom: -6px;
  left: 0;
  width: 100%;
  height: 5px;
  background-color: #dfe2ea;
  border-radius: 8px 8px 0 0;
  opacity: 0;
  transition: 0.3s;
}

.nav-item:not(.is-active):hover:before {
  opacity: 1;
  bottom: 0;
}

.nav-item:not(.is-active):hover {
  color: #333;
}

.nav-indicator {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 4px;
  transition: 0.4s;
  height: 5px;
  z-index: 1;
  border-radius: 8px 8px 0 0;
}

@media (max-width: 580px) {
  .nav {
    overflow: auto;
  }
}
</style>
