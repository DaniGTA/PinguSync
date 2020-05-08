<template>
  <div class="setup-view">
    <ProviderSelector class="setup-view-selector" v-on:change:selection="onSelection" />
    <SetupGuide class="setup-view-guide" />
    <ProviderSetup class="setup-view-settings" :selectedProvider.sync="selectedProvider" :key="selectedProvider" />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import SetupGuide from './setup-elements/SetupGuide.vue';
import ProviderSelector from './provider-setup/ProviderSelector.vue';
import ProviderSetup from './provider-setup/ProviderSetup.vue';
import ListProvider from '../../backend/api/provider/list-provider';
@Component({
	components: {
        SetupGuide,
        ProviderSelector,
        ProviderSetup
	}
})
export default class SetupView extends Vue {
  selectedProvider: null | ListProvider = null;

  onSelection(value: null | ListProvider): void {
    this.selectedProvider = value;
  }
}
</script>

<style>
.setup-view{
  display: grid;
  grid-template-columns: 0.4fr 1.6fr;
  grid-template-rows: auto 1.65fr;
  gap: 25px 25px;
  grid-template-areas: "Selector Selector" "Guide Settings";
  margin: 50px;
}

.setup-view-guide{
  grid-area: Guide;
}

.setup-view-selector{
  grid-area: Selector;
}

.setup-view-settings{
  grid-area: Settings;
}
</style>