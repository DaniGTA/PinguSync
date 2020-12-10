<template>
    <div>
        <ProviderImageBlock :provider="provider" :showText="false" @click.native="openDialog()"/>
        <q-dialog v-model="isLoginDialogOpen">
            <q-card>
                <MultiProviderLogin :provider="provider"></MultiProviderLogin>
            </q-card>
        </q-dialog>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import ProviderController from '../../../controller/provider-controller';
import ProviderImageBlock from '../../../elements/provider-elements/ProviderImageBlock.vue';
import MultiProviderLogin from '../../../first-start/provider-setup/provider-login-elements/MultiProviderLoginView.vue';
import { getModule } from 'vuex-module-decorators';
import { Prop } from 'vue-property-decorator';
import WorkerController from '../../../../backend/communication/ipc-renderer-controller';
import { chListener } from '../../../../backend/communication/listener-channels';
import { ListProviderInterface } from '../../../controller/model/list-provider-interface';
import UpdateProviderLoginStatus from '../../../../backend/controller/frontend/providers/model/update-provider-login-status';
import ListProvider from '../../../../backend/api/provider/list-provider';

const providerController = getModule(ProviderController);

@Component({
	components: {
        MultiProviderLogin,
        ProviderImageBlock
	}
})
export default class ProviderEntry extends Vue {
    isLoginDialogOpen = false;

    @Prop({required: true})
    provider!: ListProvider;

    openDialog(): void {
        console.log('Open dialog');
        this.isLoginDialogOpen = true;
    }

    mounted(): void{
        WorkerController.on(chListener.OnLoggedInStatusChange, (x) => this.anyUpdateLoginStatus(x));
    }

    anyUpdateLoginStatus(newLoginStatus: UpdateProviderLoginStatus): void{
      if(newLoginStatus.providerName === this.provider.providerName){
        this.isLoginDialogOpen = false;
      }
    }
}
</script>

<style>

</style>