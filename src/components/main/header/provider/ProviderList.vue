<template>
  <div class="header-provider-list">
      <div v-for="provider in providers" class="header-provider-entry" :key="provider.providerName">
          <ProviderImageBlock :provider="provider" :showText="false"/>
        </div>
  </div>    
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import ProviderController from '../../../controller/provider-controller';
import ProviderImageBlock from '../../../elements/provider-elements/ProviderImageBlock.vue';
import { getModule } from 'vuex-module-decorators';
import { ListProviderInterface } from '../../../controller/model/list-provider-interface';
const providerController = getModule(ProviderController);

@Component({
	components: {
        ProviderImageBlock
	}
})
export default class ProviderList extends Vue {

    providers: ListProviderInterface[] = [];

    mounted(): void{
        this.loadProviders();
    }

    async loadProviders(): Promise<void>{
        this.providers = await providerController.getAllAvaibleProviders();
        console.log(this.providers);
    }

    public destroyed (): void {
        delete this.providers;
    }
}
</script>

<style>
.header-provider-list{
    display: flex;
    justify-content: flex-end;
    height: 100%;
    align-items: center;
    width: 100%;
}

.header-provider-entry{
    margin: 0px 5px;
}
</style>