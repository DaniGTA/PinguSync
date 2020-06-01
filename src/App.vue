<template>
  <div id="app">
    <router-view></router-view>
    <VersionView />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import VersionView from './components/system/version/VersionView.vue';

import WorkerController from './backend/communication/ipc-renderer-controller';
import { chOnce } from './backend/communication/channels';

@Component({
	components: {
    VersionView,
	},
})
export default class App extends Vue {
  private workerController: WorkerController = new WorkerController();
  constructor() {
  	super();
  }

  async mounted(): Promise<void> {
    if(await this.workerController.getOnce<boolean>(chOnce.FinishedFirstSetup)){
      await this.$router.push('main');
    }else{
      await this.$router.push('setup');
    }
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
  height: 100%;
  max-height: 100%;
  overflow: hidden;
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
  height: 100%;
}

html {
  background: black;
  margin: 0;
  width: 100%;
  height: 100%;
}
</style>

