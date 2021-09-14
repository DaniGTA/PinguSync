<template>
    <div class="provider-selector-block">
        <div class="provider-selector">
            <ProviderImageBlock
                v-for="provider in providers"
                :key="provider.providerName"
                :provider="provider"
                v-on:click="onClick(provider)"
            />
        </div>
    </div>
</template>

<script lang="ts">
import { Vue, Options } from 'vue-class-component'
import ProviderImageBlock from '../../elements/provider-elements/ProviderImageBlock.vue'
import ProviderController from '../../controller/provider-controller'
import WorkerController from '@backend/communication/ipc-renderer-controller'
import { ListProviderInterface } from '@/components/controller/model/list-provider-interface'

@Options({
    components: {
        ProviderImageBlock,
    },
})
export default class ProviderSettings extends Vue {
    public workerController: WorkerController

    public providers: ListProviderInterface[] = []

    public selectedProviderName: string | null = null

    constructor() {
        super()
        this.workerController = new WorkerController()
    }

    mounted(): void {
        this.init()
    }

    onClick(provider: ListProviderInterface): void {
        console.log(provider.providerName)
        if (provider.providerName === this.selectedProviderName) {
            this.selectedProviderName = null
            this.$emit('change:selection', null)
            return
        }
        this.selectedProviderName = provider.providerName
        this.$emit('change:selection', provider)
    }

    async init(): Promise<void> {
        this.providers = await ProviderController.getAllAvaibleProviders()
    }
}
</script>

<style lang="scss" scoped>
.provider-selector-block {
    overflow-x: auto;
    overflow-y: hidden;
    background-color: $primary-background;
    text-align: -webkit-center;
}

.provider-selector {
    width: fit-content;
    display: grid;
    grid-auto-flow: column;
}
.provider-selector > div {
    margin: 5px 15px;
    float: left;
    padding: 5px;
    width: 80px;
    height: 80px;
    background: $primary-background;
}
</style>
