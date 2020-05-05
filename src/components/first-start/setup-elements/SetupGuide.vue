<template>
  <div class="setup-guide">
    <h2 class="setup-title">{{title}}</h2>
    <div class="setup-steps">
      <SetupGuideEntry v-bind:required = "true"  v-bind:description = "providerLoginDescription" v-bind:syncCompleted.sync= "anyConnectedProvider" />
      <SetupGuideEntry v-bind:required = "false" v-bind:description = "providerSetupDescription" />
      <SetupGuideEntry v-bind:required = "false" v-bind:description = "setupMoreProvidersDescription" />
    </div>
    <button  class="setup-confirm-button">Einrichtung Abschließen</button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import SetupGuideEntry from './SetupGuideEntry.vue';
import WorkerController from '../../../backend/communication/ipc-renderer-controller';
import { chOnce } from '../../../backend/communication/channels';
import UpdateProviderLoginStatus from '../../../backend/controller/frontend/providers/model/update-provider-login-status';

@Component({
	components: {
    SetupGuideEntry
	}
})
export default class SetupGuide extends Vue {

  public workerController: WorkerController = new WorkerController();


  title = 'Einrichtung';
  
  anyConnectedProvider = false;

  providerLoginDescription = 'Bei mindestens einem Provider anmelden.';
  providerSetupDescription = 'Ein Provider einstellen';
  setupMoreProvidersDescription = 'Weitere Provider einrichten.';

  async mounted(): Promise<void> {
    this.anyConnectedProvider = await this.workerController.getOnce<boolean>(chOnce.IsAnyProviderLoggedIn);
    this.workerController.on('provider-any-login-status-changed', (data: UpdateProviderLoginStatus)=> this.providerLoginStatusChange(data.isLoggedIn));
  }

  async providerLoginStatusChange(isLoggedIn: boolean): Promise<void>{
    if(isLoggedIn){
      this.anyConnectedProvider = true;
    } else {
      this.anyConnectedProvider = await this.workerController.getOnce<boolean>(chOnce.IsAnyProviderLoggedIn);
    }
  }
}
</script>

<style>
.setup-guide{
  padding-top: 10px;
  background-color: #34495e;
  color: white;
  min-width: 50px;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: auto auto auto;
  gap: 1px 1px;
  grid-template-areas: "Title" "Content" "Button";
  min-width: 200px;
}
.setup-steps > div {
  margin: 15px 5px;
}
.setup-steps{
  grid-area: Content; 
  padding: 10px;
}

.setup-title{
  grid-area: Title; 
  width: 100%;
  text-align: center;
  align-self: self-start;
}

.setup-confirm-button:disabled {
  background-color: gray;
  color: lightgray;
}

.setup-confirm-button{
  grid-area: Button; 
  background-color: green;
  color: white;
  width: 100%;
  height: 50px;
  cursor: pointer;
  font-size: 18px;
  border: none;
  align-self: end;
}
</style>