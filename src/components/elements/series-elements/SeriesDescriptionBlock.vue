<template>
  <div v-if="description" class="describtion">
    {{description.content}}
  </div>
</template>

<script lang="ts">
import Vue from 'vue';
import Component from 'vue-class-component';
import { Prop } from 'vue-property-decorator';
import Overview from '../../../backend/controller/objects/meta/overview';
import SeriesListViewController from '../../controller/series-list-view-controller';
import { getModule } from 'vuex-module-decorators';

const seriesListViewController = getModule(SeriesListViewController);

@Component
export default class SeriesDescriptionBlock extends Vue {
    @Prop({required: true})
    seriesId!: string;
    description: Overview | null = null;
    mounted(): void{
        this.loadDescription();
    }
    async loadDescription(): Promise<void>{
      this.description = (await seriesListViewController.getSeriesDescriptionById(this.seriesId)) ?? null;
    }
}
</script>


<style lang="scss" scoped>
.describtion{
  color: $primary-text;
}
</style>