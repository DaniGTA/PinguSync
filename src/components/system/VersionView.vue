<template>
  <div id="version">v0.1 Beta Preview</div>
</template>

<script>
import Component from 'vue-class-component'
import Vue from 'vue'

@Component
export default class Providers extends Vue {
}
</script>

<style>
#version {
    margin-right: 2px;
    color: gray;
    position: absolute;
    text-align: left;
    bottom: 0;
    right: 0;
    width: fit-content;
}
</style>