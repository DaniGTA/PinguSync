<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <HelloWorld msg="Welcome to Your Vue.js + TypeScript App" />
    <Providers />
    <MainList />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import HelloWorld from "./components/HelloWorld.vue";
import Providers from "./components/Providers.vue";
import MainList from "./components/MainList.vue";
import WorkerController from "./backend/controller/workerController";
import { ipcRenderer } from "electron";
import { WorkerTransfer } from "./backend/controller/objects/workerTransfer";
@Component({
  components: {
    HelloWorld,
    Providers,
    MainList
  }
})
export default class App extends Vue {
  static workerController: WorkerController = new WorkerController(ipcRenderer);
  constructor() {
    super();
    ipcRenderer.on(
      "path",
      (event: Electron.IpcRendererEvent, string: string) => {
        App.workerController.send("path", string);
      }
    );
    App.workerController.on("get-path", () => {
      ipcRenderer.send("get-path");
    });

    ipcRenderer.send("get-path");
  }
}
</script>

<style>
#app {
  font-family: "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
