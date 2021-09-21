<template>
    <img v-if="provider" class="w-6 h-6" :src="getProviderImage()" alt="episode image" />
    <div class="bg-gray-400" v-if="!provider"></div>
    <div class="w-full center" v-if="showText">{{ getName() }}</div>
</template>

<script lang="ts">
import { Vue, Options, prop, WithDefault } from 'vue-class-component'
import { ListProviderInterface } from '../../controller/model/list-provider-interface'

class Props {
    provider: WithDefault<ListProviderInterface> = prop<ListProviderInterface>({ default: null })
    showText: WithDefault<boolean> = prop<boolean>({ default: true })
}

@Options({})
export default class ProviderImageBlock extends Vue.with(Props) {
    getName(): string {
        return this.provider?.providerName ?? ''
    }

    getProviderImage() {
        const providerName = this.getName().toLowerCase()
        try {
            return require('@/assets/' + providerName + '-logo.png')
        } catch (err) {
            try {
                return require('@/assets/' + providerName + '-logo.svg')
            } catch (err) {
                console.error('Cant find provider image for provider: ' + providerName)
                return ''
            }
        }
    }
}
</script>
