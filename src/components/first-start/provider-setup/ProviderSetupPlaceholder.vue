<template>
  <div class="provider-setup-placeholder">
      Bitte wähle oben in der Liste einen Provider aus den Sie benutzen möchten.
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';

@Component({
	components: {

	}
})
export default class ProviderSetupPlaceholder extends Vue {

}
</script>

<style>
.provider-setup-placeholder{
  color: white;
}
</style>