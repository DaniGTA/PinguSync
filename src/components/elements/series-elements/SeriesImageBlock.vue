<template>
  <div class="series-image-block">
    <q-img class="series-image-block" :src="url" transition="fade" @error="onImageError">
      <template v-slot:loading>
        <q-skeleton square width="100%" height="100%" animation="fade" />
      </template>
    </q-img>
  </div>
</template>

<script lang="ts">
import Vue from "vue";
import Component from "vue-class-component";
import { Prop } from "vue-property-decorator";
import SeriesListViewController from "../../controller/series-list-view-controller";
import { FailedCover } from "../../../backend/controller/frontend/series/model/failed-cover";
import { getModule } from "vuex-module-decorators";

const seriesListViewController = getModule(SeriesListViewController);

@Component
export default class ProviderImageBlock extends Vue {
  @Prop({ required: true })
  public seriesId!: string;

  public url = "";
  private failedUrls: string[] = [];

  public mounted(): void {
    this.loadImg();
  }

  private async loadImg(): Promise<void> {
    const result =
      (await seriesListViewController.getSeriesCoverUrlById(this.seriesId)) ??
      "";
    if (!this.failedUrls.find((x) => x == result)) {
      this.url = result;
    }
  }

  private async onImageError(): Promise<void> {
    if (this.url) {
      const failedCover: FailedCover = {
        seriesId: this.seriesId,
        coverUrl: this.url,
      };
      seriesListViewController.sendFailedCover(failedCover);
      this.failedUrls.push(this.url);
      this.url = "";
      await this.wait(750);
      await this.loadImg();
    } else {
      console.error("No image src");
    }
  }

  private async wait(ms: number = 500) {
    await new Promise((resolve) => setTimeout(resolve, ms));
  }
}
</script>


<style>
.series-image-block {
  height: 100%;
  width: 100%;
}

.series-image-block img {
  height: 100%;
  width: 100%;
}
</style>
