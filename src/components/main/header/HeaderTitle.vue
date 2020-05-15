<template>
  <div class="main-header-title-box">
      <div class="main-header-title">PinguSync</div>
      <VersionText class="main-header-title-version-text"/>
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

.main-header-title-version-text{
    font-size: 12px;
    color: #B2ABAB;
}
</style>