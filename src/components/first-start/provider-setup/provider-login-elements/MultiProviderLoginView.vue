<template>
    <div v-if="provider" class="provider-login-choice">
        <div class="default-login" v-if="provider.hasDefaultLogin">
            <ProviderLogin :provider="provider" />
        </div>
        <div class="oauth-login" v-if="provider.hasOAuthLogin">
            <ProviderOAuthLogin :provider="provider" />
        </div>
        <div v-if="!provider.hasOAuthLogin && !provider.hasDefaultLogin">Keine Anmeldung Verfügbar.</div>
    </div>
</template>

<script lang="ts">
import { Vue, Options, WithDefault, prop } from 'vue-class-component'
import ProviderOAuthLogin from './ProviderOAuthLogin.vue'
import ProviderLogin from './ProviderLogin.vue'
import { ListProviderInterface } from '@/components/controller/model/list-provider-interface'

class Props {
    provider: WithDefault<ListProviderInterface> = prop<ListProviderInterface>({ default: null })
}

@Options({
    components: {
        ProviderOAuthLogin,
        ProviderLogin,
    },
})
export default class MultiProviderLogin extends Vue.with(Props) {}
</script>

<style lang="scss" scoped>
.provider-login-choice {
    display: flex;
    justify-content: space-evenly;
}

.default-login {
    background-color: $primary-background;
    grid-area: default-login;
    max-width: 350px;
    width: 100%;
    padding: 10px;
}

.oauth-login {
    background-color: $primary-background;
    grid-area: oauth-login;
    max-width: 350px;
    width: 100%;
    padding: 10px;
}
</style>
