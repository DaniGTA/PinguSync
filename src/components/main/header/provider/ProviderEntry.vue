<template>
    <div v-if="provider">
        <ProviderImageBlock :provider="provider" :showText="false" @click="openDialog()" />
        <button @click="checkLogin()">check</button>
        <GDialog v-model="isLoginDialogOpen">
            <div class="q-card">
                <template v-if="!isProviderLoggedIn">
                    <MultiProviderLogin :provider="provider"></MultiProviderLogin>
                </template>
                <template v-else> Already logged in </template>
            </div>
        </GDialog>
    </div>
</template>

<script lang="ts">
import { chOnce } from '@/backend/communication/channels'
import { ListProviderInterface } from '@/components/controller/model/list-provider-interface'
import WorkerController from '@backend/communication/ipc-renderer-controller'
import { chListener } from '@backend/communication/listener-channels'
import UpdateProviderLoginStatus from '@backend/controller/frontend/providers/model/update-provider-login-status'
import { Vue, Options, WithDefault, prop } from 'vue-class-component'
import ProviderImageBlock from '../../../elements/provider-elements/ProviderImageBlock.vue'
import MultiProviderLogin from '../../../first-start/provider-setup/provider-login-elements/MultiProviderLoginView.vue'
import 'gitart-vue-dialog/dist/style.css'
import { GDialog } from 'gitart-vue-dialog'

class Props {
    provider: WithDefault<ListProviderInterface> = prop<ListProviderInterface>({ default: null })
}

@Options({
    components: {
        GDialog,
        MultiProviderLogin,
        ProviderImageBlock,
    },
})
export default class ProviderEntry extends Vue.with(Props) {
    isLoginDialogOpen = false
    isProviderLoggedIn = false

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
