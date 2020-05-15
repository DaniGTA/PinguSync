<template>
  <div class="main">
      <MainHeader />
      <ListBlock />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import MainHeader from './header/Header.vue';
import ListBlock from './list/ListBlock.vue';

@Component({
	components: {
        MainHeader,
        ListBlock  
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
