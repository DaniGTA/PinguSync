<template>
  <div id="app">
    <FirstExperienceScreen />
    <!-- <Providers /> -->
    <!-- <MainList /> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import Providers from './components/Providers.vue'
import MainList from './components/MainList.vue'
import FirstExperienceScreen from './components/start-screen/FirstExperienceScreen.vue'
import { ipcRenderer } from 'electron'
import WorkerController from './backend/communication/ipc-renderer-controller'

@Component({
	components: {
		Providers,
		MainList,
		FirstExperienceScreen,
	},
})
export default class App extends Vue {
  static workerController: WorkerController = new WorkerController(ipcRenderer);
  constructor() {
  	super()
  	ipcRenderer.on(
  		'path',
  		(event: Electron.IpcRendererEvent, string: string) => {
  			App.workerController.send('path', string)
  		}
  	)
  	App.workerController.on('get-path', () => {
  		ipcRenderer.send('get-path')
  	})

  	ipcRenderer.send('get-path')
  }
}
</script>

<style>
@font-face {
  font-family: "Roboto";
  src: url("assets/fonts/roboto/Roboto-Medium.ttf");
}

#app {
  font-family: "Roboto", "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
#app::after {
  content: "";
  background: url("assets/background/1.jpg");
  opacity: 0.33;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  position: absolute;
  z-index: -1;
}

body {
  margin: 0;
  width: 100%;
  height: 100%;
}

html {
  background: black;
  margin: 0;
  width: 100%;
  height: 100%;
}
</style>
