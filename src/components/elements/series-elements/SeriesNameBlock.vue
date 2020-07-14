<template>
  <div class="series-name-block-text"> 
    <template v-if="name"> 
    {{name}}
    </template>
    <template v-else>
      <q-skeleton type="text" animation="fade"/>
      <q-skeleton type="text" animation="fade"/>
    </template>
    </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import SeriesListViewController from '../../controller/series-list-view-controller';
import { getModule } from 'vuex-module-decorators';

const seriesListViewController = getModule(SeriesListViewController);

@Component
export default class ProviderImageBlock extends Vue {
    @Prop({required: true})
    public seriesId!: string;

    public name = '';

    public async mounted(): Promise<void> {
        this.name = await seriesListViewController.getSeriesNameById(this.seriesId) ?? '';
    }
}
</script>


<style>
.series-name-block-text{
    color: #F5EEEE;
    z-index: 100;
}
</style>