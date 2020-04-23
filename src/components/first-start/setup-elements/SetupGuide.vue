<template>
  <div class="setupGuide">
    <h1>{{title}}</h1>
    <SetupGuideEntry v-bind:required = "true"  v-bind:description = "providerLoginDescription" v-bind:syncCompleted.sync= "anyConnectedProvider" />
    <SetupGuideEntry v-bind:required = "false" v-bind:description = "providerSetupDescription" />
    <SetupGuideEntry v-bind:required = "false" v-bind:description = "setupMoreProvidersDescription" />

  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import SetupGuideEntry from './SetupGuideEntry.vue';

@Component({
	components: {
    SetupGuideEntry
	}
})
export default class SetupGuide extends Vue {
  title = 'Einrichtung';

  providerLoginDescription = 'Bei mindestens einem Provider anmelden.';

  anyConnectedProvider = false;

  providerSetupDescription = 'Ein Provider einstellen';

  setupMoreProvidersDescription = 'Weitere Provider einrichten.'
}
</script>

<style>
.setupGuide{
  padding: 10px;
  background-color: black;
  color: white;
  min-height: 200px;
  min-width: 50px;
  max-width: fit-content;
}
</style>