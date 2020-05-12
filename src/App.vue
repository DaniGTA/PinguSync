<template>
  <div id="app">
    <router-view></router-view>
    <VersionView />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Providers from './components/Providers.vue';
import FirstExperienceScreen from './components/start-screen/FirstExperienceScreen.vue';
import VersionView from './components/system/VersionView.vue';

import { ipcRenderer } from 'electron';
import WorkerController from './backend/communication/ipc-renderer-controller';

@Component({
	components: {
		Providers,
    FirstExperienceScreen,
    VersionView,
	},
})
export default class App extends Vue {
  static workerController: WorkerController = new WorkerController();
  constructor() {
  	super();
  	ipcRenderer.on(
  		'path',
  		(event: Electron.IpcRendererEvent, string: string) => {
  			App.workerController.send('path', string);
  		}
  	);
  	App.workerController.on('get-path', () => {
  		ipcRenderer.send('get-path');
  	});

    ipcRenderer.send('get-path');
    
  }

  async mounted(): Promise<void> {
    await this.$router.push('setup');
  }
}
</script>

<style>
@font-face {
  font-family: "Roboto";
  src: url("assets/fonts/roboto/Roboto-Regular.ttf");
  font-weight: normal;
  font-style: normal;
}

@font-face {
    font-family: 'Roboto';
    src: url("assets/fonts/roboto/Roboto-Thin.ttf");
    font-weight: 100;
    font-style: normal;
}

@font-face {
    font-family: 'Roboto';
    src: url("assets/fonts/roboto/Roboto-Light.ttf");
    font-weight: 200;
    font-style: normal;
}

@font-face {
    font-family: 'Roboto';
    src: url("assets/fonts/roboto/Roboto-Medium.ttf");
    font-weight: 300;
    font-style: normal;
}

#app {
  font-family: "Roboto", "Avenir", Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
#app::after {
  content: "";
  background: url("assets/background/1.jpg");
  background-size: cover;
  opacity: 0.5;
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
}

html {
  background: black;
  margin: 0;
  width: 100%;
  height: 100%;
}
</style>

