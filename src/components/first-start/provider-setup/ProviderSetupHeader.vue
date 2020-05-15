<i18n>
{
    "en":{
        "logout": "Logout"
    }
}
</i18n>

<template>
    <div class="provider-setup-header">
        <ProviderImageBlock class="provider-image" :provider="provider" :showText="showText"/>
        <div class="provider-setup-title"></div>
        <div class="provider-name">{{provider.providerName}}</div>
        <ProviderUserInformation v-if="isProviderLoggedIn" class="user-name" />
        <button @click="logoutUser()" v-if="isProviderLoggedIn" class="provider-logout">{{$t('logout')}}</button>
    </div>
</template>

<script lang="ts">
import { Prop } from 'vue-property-decorator';
import Vue from 'vue';
import Component from 'vue-class-component';
import ProviderImageBlock from '../../elements/provider-elements/ProviderImageBlock.vue';
import ProviderUserInformation from './ProviderUserInformation.vue';
import ListProvider from '../../../backend/api/provider/list-provider';
import WorkerController from '../../../backend/communication/ipc-renderer-controller';
import { chSend } from '../../../backend/communication/send-only-channels';

@Component({
	components: {
        ProviderImageBlock,
        ProviderUserInformation
	}
})
export default class ProviderSetupHeader extends Vue {
    public workerController: WorkerController = new WorkerController();

    @Prop({required: true})
    provider!: ListProvider;
    @Prop({default: false})
    showText!: boolean;
    @Prop({default: false})
    isProviderLoggedIn!: boolean;

    public logoutUser(): void {
        this.workerController.send(chSend.LogoutUser, this.provider.providerName);
    }
}
</script>

<style>
.provider-setup-header{
    display: grid;
    grid-template-columns: 50px 100px auto auto;
    grid-template-rows: auto auto;
    grid-template-areas: "provider-image provider-name provider-setup-title provider-logout" "provider-image user-name provider-setup-title provider-logout";
    padding: 0px 10px;
    gap: 0px 10px;
}

.provider-image { 
    grid-area: provider-image; 
}

.provider-name { 
    grid-area: provider-name; 
    align-self: end;
}

.provider-logout{
    grid-area: provider-logout; 
    border: none;
    margin: 20px;
    width: 100px;
    justify-self: flex-end;
    background-color: #de5252;
    color: white;
    font-size: 16px;
    cursor: pointer;
}

.user-name { 
    grid-area: user-name; 
}

.provider-setup-title { 
    grid-area: provider-setup-title;
    font-size: 48px;
    margin: auto 0px;
}


</style>