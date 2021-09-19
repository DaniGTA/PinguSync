<template>
    <div v-if="provider" class="w-auto h-full flex flex-col flex-shrink">
        <div class="h-1/2 cursor-pointer" v-on:click="openDialog()">
            <ProviderImageBlock :provider="provider" :showText="false" />
        </div>
        <template v-if="isProviderLoggedIn == null">{{ this.$t('Main.provider-entry.loading') }}</template>
        <template v-else-if="isProviderLoggedIn">{{ this.$t('Main.provider-entry.logged-in') }}</template>
        <template v-else>{{ $t('Main.provider-entry.logged-out') }}</template>
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
    isProviderLoggedIn: boolean | null = null

    openDialog(): void {
        this.isLoginDialogOpen = true
    }

    mounted(): void {
        WorkerController.on<UpdateProviderLoginStatus>(chListener.OnLoggedInStatusChange, x =>
            this.anyUpdateLoginStatus(x)
        )
        this.checkLogin()
    }

    async checkLogin() {
        this.isProviderLoggedIn = await WorkerController.getOnce<boolean>(
            chOnce.GetLoggedInStatus,
            this.provider.providerName
        )
    }

    anyUpdateLoginStatus(newLoginStatus: UpdateProviderLoginStatus): void {
        console.log(newLoginStatus)
        if (newLoginStatus.providerName === this.provider.providerName) {
            this.isLoginDialogOpen = false
            this.isProviderLoggedIn = newLoginStatus.isLoggedIn
        }
    }
}
</script>
