<template>
  <div>
      <LoadingScreen></LoadingScreen>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import WelcomeScreen from './welcome-screen/WelcomeScreen.vue';
import LoadingScreen from '../loading-screen/LoadingScreen.vue';
@Component({
	components: {
		WelcomeScreen,
		LoadingScreen
	}
})
export default class FirstExperienceScreen extends Vue {

}
</script>

<style>

</style>

