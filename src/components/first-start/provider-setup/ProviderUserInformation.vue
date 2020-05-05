<template>
  <div class="provider-user-name" v-if="username !== ''"><i class="fas fa-user"></i> {{username}}</div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import ListProvider from '../../../backend/api/provider/list-provider';
import { Prop } from 'vue-property-decorator';
import WorkerController from '../../../backend/communication/ipc-renderer-controller';
import { chOnce } from '../../../backend/communication/channels';

@Component({
	components: {

	}
})
export default class ProviderUserInformation extends Vue {
  public workerController: WorkerController = new WorkerController();

  public username = '';

  @Prop({required: true})
  provider!: ListProvider;

  async mounted(): Promise<void>{
    if(this.provider){
      this.username = await this.workerController.getOnce(chOnce.GetUserNameFromProvider, this.provider.providerName);
    }
  }
}
</script>


<style>
.provider-user-name {
    color: #e0e0e0;
    font-size: small;
}
</style>