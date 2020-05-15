<template>
  <div class="provider-setup-settings">
    <div v-if="syncedSelectedProvider" class="provider-setup-entry">
      <ProviderSetupHeader :provider="syncedSelectedProvider" class="provider-setup-header" :isProviderLoggedIn="isLoggedIn" :key="syncedSelectedProvider"/>
      <MultiProviderLoginView v-if="!isLoggedIn" class="setup" :provider="syncedSelectedProvider" :key="syncedSelectedProvider" />
      <ProviderSettings v-if="isLoggedIn" :provider="syncedSelectedProvider" :key="syncedSelectedProvider" />
    </div>
    <template v-else>
      <ProviderSetupPlaceholder />
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { PropSync, Watch } from 'vue-property-decorator';
import MultiProviderLoginView from './provider-login-elements/MultiProviderLoginView.vue';
import ProviderSetupPlaceholder from './ProviderSetupPlaceholder.vue';
import ProviderUserInformation from './ProviderUserInformation.vue';
import ProviderSetupHeader from './ProviderSetupHeader.vue';
import WorkerController from '../../../backend/communication/ipc-renderer-controller';
import ListProvider from '../../../backend/api/provider/list-provider';
import ProviderSettings from './provider-settings/ProviderSettings.vue';
import UpdateProviderLoginStatus from '../../../backend/controller/frontend/providers/model/update-provider-login-status';
import { chOnce } from '../../../backend/communication/channels';
import { chListener } from '../../../backend/communication/listener-channels';
@Component({
	components: {
    MultiProviderLoginView,
    ProviderSetupPlaceholder,
    ProviderUserInformation,
    ProviderSetupHeader,
    ProviderSettings
	}
})
export default class ProviderSetup extends Vue {
    public workerController: WorkerController = new WorkerController();

    @PropSync('selectedProvider', {type: String}) 
    public syncedSelectedProvider!: ListProvider;

    public isLoggedIn = false;

    @Watch('selectedProvider', { immediate: true, deep: true })
    async onSelectionChange(val: ListProvider, oldVal: ListProvider): Promise<void>{
      try{
        this.isLoggedIn = false;
        if(oldVal){
          this.workerController.removeListener('provider-any-login-status-changed', (x) => this.anyUpdateLoginStatus(x));
        }
        if(val){
          console.log('listen for auth status');
          this.updateLoginStatus(await this.workerController.getOnce(chOnce.GetLoggedInStatus, val.providerName));
          this.workerController.on(chListener.OnLoggedInStatusChange, (x) => this.anyUpdateLoginStatus(x));
          console.log('listen for auth status finished');
        }
      } catch(err){
        console.log(err);
      }
    }

    anyUpdateLoginStatus(data: UpdateProviderLoginStatus): void {
      if(data.providerName === this.syncedSelectedProvider.providerName){
        this.isLoggedIn = data.isLoggedIn;
      }
    }

    updateLoginStatus(newLoggedInStatus: boolean): void {
      this.isLoggedIn = newLoggedInStatus;
    }
}
</script>

<style>
.provider-setup-header {
  background-color: #2980b9;
  grid-area: Header;
}

.provider-setup-settings{
  width: 100%;
  height: 100%;
  background-color: #34495e;;
  color: white;
}

.provider-setup-entry {
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: 75px auto;
  gap: 15px 0px;
  grid-template-areas: "Header" "Setup";
  height: 100%;
}

.providerName { 
  grid-area: ProviderName; 
  align-self: end;
}

.provider { 
  grid-area: Provider; 
}

.userName { 
  grid-area: UserName; 
}

.setup { 
  grid-area: Setup;
}

.title { 
  grid-area: Title; 
}

</style>