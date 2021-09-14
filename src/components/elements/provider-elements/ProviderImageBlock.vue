<template>
    <div class="provider-image-block" v-if="provider">
        <img
            class="provider-image-block-image"
            :src="require('@/assets/' + getName().toLowerCase() + '-logo.png')"
            :width="size"
            :height="size"
            alt="episode image"
        />
        <q-skeleton class="provider-image-block-image" v-if="!provider" />
        <div class="provider-name-block-name" v-if="showText">{{ getName() }}</div>
    </div>
</template>

<script lang="ts">
import { Vue, Options, prop, WithDefault } from 'vue-class-component'
import { ListProviderInterface } from '../../controller/model/list-provider-interface'

class Props {
    provider: WithDefault<ListProviderInterface> = prop<ListProviderInterface>({ default: null })
    size: WithDefault<number> = prop<number>({ default: 50 })
    showText: WithDefault<boolean> = prop<boolean>({ default: true })
}

@Options({})
export default class ProviderImageBlock extends Vue.with(Props) {
    getName(): string {
        return this.provider?.providerName ?? ''
    }
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
    grid-template-areas: 'Image' 'Name';
    width: 100%;
    place-content: center;
}
</style>
