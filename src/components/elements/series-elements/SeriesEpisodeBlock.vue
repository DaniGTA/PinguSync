<template>
  
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import ListProvider from '../../../backend/api/provider/list-provider';

@Component
export default class ProviderImageBlock extends Vue {
    @Prop({required: true})
    provider!: ListProvider;

    @Prop()
    showText = true;
}
</script>


<style>

</style>