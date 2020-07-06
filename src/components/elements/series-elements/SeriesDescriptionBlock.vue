Sho<template>
  <div v-if="description">
    {{description.content}}
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import Overview from '../../../backend/controller/objects/meta/overview';
import SeriesListViewController from '../../controller/series-list-view-controller';

@Component
export default class SeriesDescriptionBlock extends Vue {
    @Prop({required: true})
    id!: string;
    description: Overview | null = null;
    mounted(): void{
        this.loadDescription();
    }
    async loadDescription(): Promise<void>{
      this.description = (await SeriesListViewController.getSeriesDescriptionById(this.id)) ?? null;
    }
}
</script>


<style>

</style>