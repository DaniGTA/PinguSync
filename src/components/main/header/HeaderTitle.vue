<template>
  <div class="main-header-title-box">
      <div class="main-header-title">PinguSync</div>
      <q-badge color="primary"><VersionText class="main-header-title-version-text"/></q-badge>
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import VersionText from '../../system/version/VersionText.vue';
@Component({
	components: {
        VersionText
	}
})
export default class MainHeaderTitle extends Vue {

}
</script>

<style>
.main-header-title-box{
    margin: 5px;
}

.main-header-title{
    font-size: 24px;
    color: #EFEFEF;
}
</style>