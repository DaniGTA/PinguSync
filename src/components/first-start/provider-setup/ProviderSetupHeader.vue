<template>
    <div class="provider-setup-header">
        <ProviderImageBlock class="provider-image" :provider="provider" :showText="showText"/>
        <div class="provider-setup-title"></div>
        <div class="provider-name">{{provider.providerName}}</div>
        <ProviderUserInformation class="user-name" />
    </div>
</template>

<script lang="ts">
import { Prop } from 'vue-property-decorator';
import Vue from 'vue';
import Component from 'vue-class-component';
import { PropSync } from 'vue-property-decorator';
import ProviderImageBlock from './provider-elements/ProviderImageBlock.vue';
import ProviderUserInformation from './ProviderUserInformation.vue';
import ListProvider from '../../../backend/api/provider/list-provider';

@Component({
	components: {
    ProviderImageBlock,
    ProviderUserInformation
	}
})
export default class ProviderSetupHeader extends Vue {
    @Prop({required: true})
    provider!: ListProvider;

    showText = false;
}
</script>

<style>
.provider-setup-header{
    display: grid;
    grid-template-columns: 50px 100px auto;
    grid-template-rows: auto auto;
    grid-template-areas: "provider-image provider-name provider-setup-title" "provider-image user-name provider-setup-title";
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

.user-name { 
    grid-area: user-name; 
}

.provider-setup-title { 
    grid-area: provider-setup-title;
    font-size: 48px;
    margin: auto 0px;
}


</style>