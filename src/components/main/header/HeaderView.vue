<template>
  <div class="main-header">
    <HeaderTitle />
    <ProviderList />
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import ProviderList from './provider/ProviderList.vue';
import HeaderTitle from './HeaderTitle.vue';

@Component({
    components: {
      ProviderList,
      HeaderTitle
    }
})
export default class MainHeader extends Vue {}
</script>

<style>
.main-header{
  width: 100%;
  height: 70px;
  background-color:#1E242D;
  display: flex;
}
</style>