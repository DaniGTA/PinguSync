<i18n>
{
  "en": {
    "provider-login-description": "Bei mindestens einem Provider anmelden.",
    "provider-setup-description": "Ein Provider einstellen",
    "provider-setup-more-description": "Weitere Provider einrichten.",
    "title": "Einrichtung",
    "complete-setup": "Complete Setup"
  }
}
</i18n>

<template>
  <div class="setup-guide">
    <div class="setup-title">{{$t('title')}}</div>
    <div class="setup-steps">
      <SetupGuideEntry v-bind:required = "true" :completed="anyConnectedProvider"  v-bind:description = "$t('provider-login-description')" v-bind:syncCompleted.sync= "anyConnectedProvider" />
      <SetupGuideEntry v-bind:required = "false" v-bind:description = "$t('provider-setup-description')" />
      <SetupGuideEntry v-bind:required = "false" v-bind:description = "$t('provider-setup-more-description')" />
    </div>
    <button :disabled="!anyConnectedProvider" @click="finishSetup()" class="setup-confirm-button">{{$t('complete-setup')}}</button>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import SetupGuideEntry from './SetupGuideEntry.vue';
import WorkerController from '../../../backend/communication/ipc-renderer-controller';
import { chOnce } from '../../../backend/communication/channels';
import UpdateProviderLoginStatus from '../../../backend/controller/frontend/providers/model/update-provider-login-status';
import { chListener } from '../../../backend/communication/listener-channels';
import { chSend } from '../../../backend/communication/send-only-channels';

@Component({
	components: {
    SetupGuideEntry
	}
})
export default class SetupGuide extends Vue {

  public workerController: WorkerController = new WorkerController();
  
  public anyConnectedProvider = false;

  async mounted(): Promise<void> {
    this.workerController.on(chListener.OnLoggedInStatusChange, async (data: UpdateProviderLoginStatus) => await this.providerLoginStatusChange(data.isLoggedIn));
    this.anyConnectedProvider = await this.workerController.getOnce<boolean>(chOnce.IsAnyProviderLoggedIn);
  }

  finishSetup(): void {
    this.workerController.send(chSend.FinishFirstSetup);
    this.$router.push('main');
  }

  async providerLoginStatusChange(isLoggedIn: boolean): Promise<void>{
    console.log('Login status change detected.');
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