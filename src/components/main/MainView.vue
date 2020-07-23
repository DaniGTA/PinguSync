<template>
  <q-layout view="hHh lpR fFf main">
      <MainHeader />
      <q-page-container class="page">
        <router-view />
      </q-page-container>
  </q-layout>
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

<style scoped>
.main{
  height: 100%;
}
.page {
  height: 100%;
}
</style>
