<template>
    <div class="provider-selector-block">
        <div class="provider-selector">
            <ProviderImageBlock v-for="provider in providers" :key="provider.providerName" :provider="provider"  v-on:click.native="onClick(provider)"/>
        </div>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import WorkerController from '../../../backend/communication/ipc-renderer-controller';
import ProviderImageBlock from '../../elements/provider-elements/ProviderImageBlock.vue';
import ProviderController from '../../controller/provider-controller';
import { getModule } from 'vuex-module-decorators';
import { ListProviderInterface } from '../../controller/model/list-provider-interface';

const providerController = getModule(ProviderController);

@Component({
	components: {
        ProviderImageBlock
	}
})
export default class ProviderSettings extends Vue {
    public workerController: WorkerController;

    public providers: ListProviderInterface[] = [];

    public selectedProviderName: string | null =  null;


    constructor(){
        super();
        this.workerController = new WorkerController();
    }

    mounted(): void{
        this.init();
    }

    onClick(provider: ListProviderInterface): void {
        console.log(provider.providerName);
        if(provider.providerName === this.selectedProviderName){
            this.selectedProviderName = null;
            this.$emit('change:selection', null);
            return;
        }
        this.selectedProviderName = provider.providerName;
        this.$emit('change:selection', provider);
    }

    async init(): Promise<void> {
        this.providers = await providerController.getAllAvaibleProviders();
    }
}
</script>

<style lang="scss" scoped>
.provider-selector-block{
    overflow-x: auto;
    overflow-y: hidden;
    background-color: $primary-background;
    text-align: -webkit-center;
}

.provider-selector{
    width: fit-content;
    display: grid;
    grid-auto-flow: column;
}
.provider-selector > div{
    margin: 5px 15px;
    float: left;
    padding: 5px;
    width: 80px;
    height: 80px;
    background: $primary-background;
}
</style>