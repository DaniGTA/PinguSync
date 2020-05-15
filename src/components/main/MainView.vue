<template>
  <div class="main">
      <MainHeader />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import MainHeader from './header/header.vue';
@Component({
	components: {
        MainHeader  
	}
})
export default class Main extends Vue {

}
</script>

<style>

</style>