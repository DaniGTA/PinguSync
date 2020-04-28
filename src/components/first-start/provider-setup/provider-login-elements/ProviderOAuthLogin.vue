<template>
    <div class="provider-o-auth-login">
        <div></div>
        <i class="fas fa-lock-open"></i>
        <button class="provider-o-auth-login-button">Im Browser Anmelden</button>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import ListProvider from '../../../../backend/api/provider/list-provider';
import { Prop } from 'vue-property-decorator';

@Component({
	components: {

	}
})
export default class ProviderOAuthLogin extends Vue {
  @Prop({required: true})
  provider!: ListProvider;
}
</script>

<style>
.provider-o-auth-login{
    height: 100%;
    display: grid;
    grid-template-columns: 1fr;
    grid-template-rows: 1fr 1fr 1fr;
    gap: 1px 1px;
    grid-template-areas: "logo" "test" "button";
    padding: 10px 10px 0px 10px;
    width: 100%;
    min-width: 150px;
}
.provider-o-auth-login-button {
  background-color: green;
  border: none;
  color: white;
  align-self: end;
  width: 100%;
  height: 50px;
  cursor: pointer;
  font-size: 18px;
}
</style>