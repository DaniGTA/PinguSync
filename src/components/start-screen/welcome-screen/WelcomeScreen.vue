<template>
  <div>
    <WelcomeTitle :stitle.sync="title"/>
    <LoadingBalls/>
    <img src="@/assets/welcome-screen/welcome_screen_img_1.svg" width="220" height="220"/>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import LoadingBalls from './LoadingBalls.vue'
import WelcomeTitle from './WelcomeTitle.vue'
@Component({
	components: {
		LoadingBalls,
		WelcomeTitle,
	}
})
export default class WelcomeScreen extends Vue {
  title = 'Willkommen bei AtsuListManager'
}
</script>

<style>
</style>

