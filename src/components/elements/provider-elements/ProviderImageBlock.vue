<template>
    <div class="provider-image-block">
        <img class="provider-image-block-image" :src="require('@/assets/'+provider.providerName.toLowerCase() + '-logo.png')" :width="size" :height="size" />
        <div class="provider-name-block-name" v-if="showText">{{provider.providerName}}</div>
    </div>
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

    @Prop({default: 50})
    size!: number;

    @Prop({default: true})
    showText!: boolean;
}
</script>

<style>
.provider-image-block-image {
    grid-area: Image;
}

.provider-name-block-name {
    color: white;
    text-align: center;
    grid-area: Name;
}

.provider-image-block {
    display: grid;
    grid-template-columns: auto;
    grid-template-rows: auto auto;
    gap: 1px 1px;
    grid-template-areas: "Image" "Name";
    width: 100%;
    place-content: center;
}
</style>