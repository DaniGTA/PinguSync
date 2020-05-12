<template>
    <div v-if="provider" class="provider-login-choice">
        <div class="default-login" v-if="provider.hasDefaultLogin">
            <ProviderLogin :provider="provider" />
        </div>
        <div class="oauth-login" v-if="provider.hasOAuthLogin">
            <ProviderOAuthLogin :provider="provider" />
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import ProviderOAuthLogin from './ProviderOAuthLogin.vue';
import ProviderLogin from './ProviderLogin.vue';
import ListProvider from '../../../../backend/api/provider/list-provider';
@Component({
	components: {
        ProviderOAuthLogin,
        ProviderLogin
	}
})
export default class MultiProviderLogin extends Vue {
  @Prop({required: true})
  provider!: ListProvider;
}
</script>

<style>
.provider-login-choice{
    display: flex;
    justify-content: space-evenly;
}

.default-login {
    background-color: #2c3e50;
    grid-area: default-login;
    max-width: 350px;
    width: 100%;
    padding: 10px;
}

.oauth-login {
    background-color: #2c3e50;
    grid-area: oauth-login; 
    max-width: 350px;
    width: 100%;
    padding: 10px;
}
</style>