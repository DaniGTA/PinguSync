<template>
  <div class="hover">
    <q-separator />
    <ShowStatusOfSingleProvider
      v-for="provider of providers"
      :provider="provider"
      :key="provider.providerName+'syncHover'"
    />
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import ProviderController from "../../../../../controller/provider-controller";
import ShowStatusOfSingleProvider from "./provider-sync-status/ShowStatusOfSingleProvider.vue";
import { Prop } from "vue-property-decorator";
import SeriesHoverController from "./../../../../../controller/series-hover-controller";
import { getModule } from "vuex-module-decorators";
import { ListProviderInterface } from "../../../../../controller/model/list-provider-interface";

@Component({
  components: {
    ShowStatusOfSingleProvider,
  },
  methods: {
    destroyed: () => {
      console.error("ALARM COMPONENT FÄLLT");
    },
  },
})
export default class BlockListEntrySyncStatusHover extends Vue {
  providers: ListProviderInterface[] = [];

  private providerController = getModule(ProviderController);
  private seriesHoverController = getModule(SeriesHoverController);

  @Prop({ required: true })
  seriesId!: string;
  created(): void {
    this.loadProviders();
    console.log("Hover entry: " + this.seriesId);
    this.seriesHoverController.SET_currentlyHoveringSeriesId(this.seriesId);
  }

  async loadProviders(): Promise<void> {
    console.log("Providers loaded");
    this.providers = await this.providerController.getAllProviderWithConnectedUser();
  }
}
</script>

<style scoped>
.hover {
  height: 205px;
  display: flex;
  margin: 15px;
}
</style>
