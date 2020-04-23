<template>
  <div class="LoaderBalls">
	<div class="LoaderBalls__item"></div>
	<div class="LoaderBalls__item"></div>
	<div class="LoaderBalls__item"></div>
   </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
@Component
export default class LoadingAnimation extends Vue {

}
</script>

<style>
.LoaderBalls {
  width: 125px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.LoaderBalls__item {
  width: 25px;
  height: 25px;
  border-radius: 50%;
  background: #9cb3e3;
}
.LoaderBalls__item:nth-child(1) {
  animation: bouncing 0.7s alternate infinite cubic-bezier(0.6, 0.05, 0.15, 0.95);
}
.LoaderBalls__item:nth-child(2) {
  animation: bouncing 0.7s 0.1s alternate infinite cubic-bezier(0.6, 0.05, 0.15, 0.95) backwards;
}
.LoaderBalls__item:nth-child(3) {
  animation: bouncing 0.7s 0.2s alternate infinite cubic-bezier(0.6, 0.05, 0.15, 0.95) backwards;
}

@keyframes bouncing {
  0% {
    transform: translate3d(0, 5px, 0) scale(1.05, 0.95);
  }
  100% {
    transform: translate3d(0, -10px, 0) scale(0.95, 1.05);
  }
}


</style>
