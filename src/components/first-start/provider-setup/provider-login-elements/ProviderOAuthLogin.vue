<template>
    <div class="provider-o-auth-login">
        <i class="fas fa-lock-open provider-o-auth-login-logo"></i>
        <div class="provider-o-auth-login-description">Die Anmeldedaten vom Browser übernehmen.</div>
        <button class="provider-o-auth-login-button" @click="oauthLogin()">Im Browser Anmelden</button>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import ListProvider from '../../../../backend/api/provider/list-provider';
import { Prop } from 'vue-property-decorator';
import WorkerController from '../../../../backend/communication/ipc-renderer-controller';

@Component({
	components: {

	}
})
export default class ProviderOAuthLogin extends Vue {
  @Prop({required: true})
  provider!: ListProvider;

  public workerController: WorkerController;

  constructor(){
      super();
      this.workerController = new WorkerController();
  }

  async oauthLogin(): Promise<void> {
    await this.workerController.getOnce<boolean>('oauth-login-provider', this.provider.providerName);
  }
}
</script>

<style>
.provider-o-auth-login{
    height: 100%;
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto auto auto;
    gap: 25px 0px;
    grid-template-areas: "logo" "description" "button";
    width: 100%;
    min-width: 150px;
}

.provider-o-auth-login-button {
  background-color: green;
  border: none;
  color: white;
  align-self: end;
  width: 100%;
  height: 50px;
  cursor: pointer;
  font-size: 18px;
  grid-area: button;
}

.provider-o-auth-login-description {
  grid-area: description;
  font-size: smaller;
}

.provider-o-auth-login-logo {
  grid-area: logo;
  font-size: 98px;
  justify-self: center;
}
</style>