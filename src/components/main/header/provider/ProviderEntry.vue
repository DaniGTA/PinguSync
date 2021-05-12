<template>
    <div>
        <ProviderImageBlock :provider="provider" :showText="false" @click.native="openDialog()" />
        <button @click="checkLogin()">check</button>
        <q-dialog v-model="isLoginDialogOpen">
            <q-card>
                <template v-if="!isProviderLoggedIn">
                    <MultiProviderLogin :provider="provider"></MultiProviderLogin>
                </template>
                <template v-else>
                    Already logged in
                </template>
            </q-card>
        </q-dialog>
    </div>
</template>

<script lang="ts">
import Vue from 'vue'
import Component from 'vue-class-component'
import ProviderController from '../../../controller/provider-controller'
import ProviderImageBlock from '../../../elements/provider-elements/ProviderImageBlock.vue'
import MultiProviderLogin from '../../../first-start/provider-setup/provider-login-elements/MultiProviderLoginView.vue'
import { getModule } from 'vuex-module-decorators'
import { Prop } from 'vue-property-decorator'
import WorkerController from '../../../../backend/communication/ipc-renderer-controller'
import { chListener } from '../../../../backend/communication/listener-channels'
import UpdateProviderLoginStatus from '../../../../backend/controller/frontend/providers/model/update-provider-login-status'
import ListProvider from '../../../../backend/api/provider/list-provider'
import { chOnce } from '../../../../backend/communication/channels'

const providerController = getModule(ProviderController)

@Component({
    components: {
        MultiProviderLogin,
        ProviderImageBlock,
    },
})
export default class ProviderEntry extends Vue {
    isLoginDialogOpen = false
    isProviderLoggedIn = false
    @Prop({ required: true })
    provider!: ListProvider

    openDialog(): void {
        console.log('Open dialog')
        this.isLoginDialogOpen = true
    }

    async mounted(): Promise<void> {
        WorkerController.on(chListener.OnLoggedInStatusChange, x => this.anyUpdateLoginStatus(x))
        this.checkLogin()
    }

    async checkLogin() {
        this.isProviderLoggedIn = await WorkerController.getOnce<boolean>(
            chOnce.GetLoggedInStatus,
            this.provider.providerName
        )
        console.log(this.isProviderLoggedIn)
    }

    anyUpdateLoginStatus(newLoginStatus: UpdateProviderLoginStatus): void {
        if (newLoginStatus.providerName === this.provider.providerName) {
            this.isLoginDialogOpen = false
            this.isProviderLoggedIn = newLoginStatus.isLoggedIn
        }
    }
}
</script>

<style></style>
