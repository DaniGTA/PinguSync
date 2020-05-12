<template>
    <section class="section">
  <div class="container">
       <h1>{{welcomeTitle}}</h1>
  </div>
  </section>

</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { PropSync } from 'vue-property-decorator';
@Component({
	components: {
    
	}
})
export default class App extends Vue {
@PropSync('stitle', { type: String })   
welcomeTitle!: string;
}
</script>

<style>
.container{
  width: 100%;
  text-align: center;
}
</style>