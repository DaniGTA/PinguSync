<template>
  <div>
    <SetupGuide />
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import SetupGuide from './setup-elements/SetupGuide.vue';
import ProviderSelector from './provider-setup/ProviderSelector.vue';
import ProviderSetup from './provider-setup/ProviderSetup.vue';
@Component({
	components: {
        SetupGuide,
        ProviderSelector,
        ProviderSetup
	}
})
export default class SetupView extends Vue {

}
</script>

<style>

</style>