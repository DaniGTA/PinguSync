<template>
    <div class="loading-title">{{loadingTitle}}</div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { PropSync } from 'vue-property-decorator';
@Component
export default class LoadingTitle extends Vue {
@PropSync('stitle', { type: String })   
loadingTitle!: string;
}
</script>

<style lang="scss" scoped>

.loading-title {
  z-index: 3;
  color: $primary-text;
  font-family: Roboto;
  font-size: 72px;
  font-weight: 300;
  line-height: 115px;
  text-align: center;
  letter-spacing: -1.5px;
}
</style>