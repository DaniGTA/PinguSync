<template>
  <div class="provider-setup-settings">
    <div v-if="syncedSelectedProvider" class="provider-setup-entry">
      <ProviderSetupHeader :provider="syncedSelectedProvider" class="provider-setup-header">
      </ProviderSetupHeader>
      <MultiProviderLoginView class="setup" :provider="syncedSelectedProvider" />
    </div>
    <template v-else>
      <ProviderSetupPlaceholder />
    </template>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { PropSync } from 'vue-property-decorator';
import ProviderList from '../../../backend/controller/provider-controller/provider-manager/provider-list';
import ProviderImageBlock from './provider-elements/ProviderImageBlock.vue';
import MultiProviderLoginView from './provider-login-elements/MultiProviderLoginView.vue';
import ProviderSetupPlaceholder from './ProviderSetupPlaceholder.vue';
import ProviderUserInformation from './ProviderUserInformation.vue';
import ProviderSetupHeader from './ProviderSetupHeader.vue';
@Component({
	components: {
    ProviderImageBlock,
    MultiProviderLoginView,
    ProviderSetupPlaceholder,
    ProviderUserInformation,
    ProviderSetupHeader
	}
})
export default class ProviderSettings extends Vue {
    @PropSync('selectedProvider', { type: ProviderList }) 
    public syncedSelectedProvider!: ProviderList;
}
</script>

<style>
.provider-setup-header {
  background-color: #2980b9;
  grid-area: Header;
}

.provider-setup-settings{
  width: 100%;
  height: 100%;
  background-color: #34495e;;
  color: white;
}

.provider-setup-entry {
  display: grid;
  grid-template-columns: auto;
  grid-template-rows: 75px auto;
  gap: 15px 0px;
  grid-template-areas: "Header" "Setup";
  height: 100%;
}

.providerName { 
  grid-area: ProviderName; 
  align-self: end;
}

.provider { 
  grid-area: Provider; 
}

.userName { 
  grid-area: UserName; 
}

.setup { 
  grid-area: Setup;
}

.title { 
  grid-area: Title; 
}

</style>