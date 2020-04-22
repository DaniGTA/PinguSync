<template>
  <div>
      <LoadingScreen></LoadingScreen>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import WelcomeScreen from './welcome-screen/WelcomeScreen.vue'
import ProviderChoiceScreen from './provider-choice-screen/ProviderChoiceScreen.vue'
import LoadingScreen from '../loading-screen/LoadingScreen.vue'
@Component({
	components: {
		WelcomeScreen,
		ProviderChoiceScreen,
		LoadingScreen
	}
})
export default class FirstExperienceScreen extends Vue {

}
</script>

<style>

</style>

