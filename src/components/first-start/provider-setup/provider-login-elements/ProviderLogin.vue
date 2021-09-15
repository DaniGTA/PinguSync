<template>
    <div v-if="provider" class="provider-login">
        <div class="provider-login-title">Bei Anmelden.</div>
        <div class="provider-login-credentials">
            <div class="provider-login-credentials-username">
                <div>Benutzername</div>
                <input v-model="username" />
            </div>
            <div class="provider-login-credentials-password">
                <div>Passwort</div>
                <input type="password" v-model="password" />
            </div>
        </div>
        <button @click="defaultLogin()" class="provider-login-button">Anmelden</button>
    </div>
</template>

<script lang="ts">
import { ListProviderInterface } from '@/components/controller/model/list-provider-interface'
import WorkerController from '@backend/communication/ipc-renderer-controller'
import { chSend } from '@backend/communication/send-only-channels'
import FrontendDefaultLogin from '@backend/controller/frontend/providers/model/frontend-default-login'
import { Vue, Options, prop, WithDefault } from 'vue-class-component'
import ProviderOAuthLogin from './ProviderOAuthLogin.vue'

class Props {
    provider: WithDefault<ListProviderInterface> = prop<ListProviderInterface>({ default: null })
}

@Options({
    components: {
        ProviderOAuthLogin,
    },
})
export default class ProviderLogin extends Vue.with(Props) {
    username: string = ''
    password: string = ''

    async defaultLogin() {
        WorkerController.send(chSend.DefaultProviderLogin, {
            providerName: this.provider.providerName,
            username: this.username,
            password: this.password,
        } as FrontendDefaultLogin)
    }
}
</script>

<style>
.provider-login {
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: auto auto auto;
    gap: 1px 1px;
    grid-template-areas: 'Title' 'Credentials' 'Button';
    width: fit-content;
    min-width: 150px;
    justify-self: center;
    width: 100%;
    height: 100%;
}

.provider-login-title {
    grid-area: Title;
}

.provider-login-credentials {
    grid-area: Credentials;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr;
    gap: 1px 1px;
    grid-template-areas: 'Username' 'Password';
    font-weight: 200;
}

.provider-login-button {
    grid-area: Button;
    background-color: green;
    border: none;
    color: white;
    align-self: end;
    width: 100%;
    height: 50px;
    cursor: pointer;
    font-size: 18px;
}

.provider-login-credentials-username {
    grid-area: Username;
}

.provider-login-credentials-password {
    grid-area: Password;
}

.provider-login input {
    padding: 5px;
    color: black;
    background-color: #b1b1b1;
    border: none;
    box-shadow: inset black 0px 0px 3px;
    width: -webkit-fill-available;
}
</style>
