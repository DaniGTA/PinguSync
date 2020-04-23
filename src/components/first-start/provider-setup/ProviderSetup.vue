<template>
  <div> 
      <div>Title</div>
      <ProviderSelector />
      
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import ProviderSelector from './ProviderSelector.vue'
import Component from 'vue-class-component'

@Component({
	components: {
    ProviderSelector
	}
})export default class ProviderSettings extends Vue {

}
</script>

<style>

</style>