<template>
  <div class="main">
      <MainHeader />
      <router-view />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import MainHeader from './header/HeaderView.vue';

@Component({
	components: {
        MainHeader,
          
	}
})
export default class Main extends Vue {

}
</script>

<style>
.main{
  height: 100%;
}
</style>
