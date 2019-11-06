<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png" />
    <Providers />
    <MainList />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from "vue-property-decorator";
import Providers from "./components/Providers.vue";
import MainList from "./components/MainList.vue";
import { ipcRenderer } from "electron";
import WorkerController from './backend/communication/ipc-renderer-controller';

@Component({
  components: {
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
}
</style>
