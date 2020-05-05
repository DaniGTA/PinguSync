<template>
  <div v-if="seriesPackage" class="main-list-entry-content">
    <div>{{name}}</div>
    <div>{{cover}}</div>
    <img v-lazy.container="cover" class="series-cover" />
    <button @click="clog(seriesPackage)">Log</button>
    <button @click="removeSeriesPackage(seriesPackage)">Delete Package</button>

    <div v-for="item of seriesPackage.allRelations" v-bind:key="item.id">
      <button @click="logNames(item)">Log names</button>
      <button @click="showMapping(item)">Show mapping</button>
      <Promised
        :promise="getSeason(item)"
        v-slot:combined="{ isPending, isDelayOver, data }"
      >Season: {{ data }}</Promised>
      <Promised
        :promise="canSync(item)"
        v-slot:combined="{ isPending, isDelayOver, data, error }"
      >{{ data }} {{ error }}</Promised>
      <div
        v-for="listProvider of item.listProviderInfosBinded"
        v-bind:key="listProvider.provider+item.id"
      >
        {{listProvider.provider}}
        {{getProviderWatchProgress(listProvider)}}
        /
        {{getProviderEpisodesCount(listProvider)}}

        (id: {{listProvider.id}} )
      </div>
    </div>
    <ShowEpisodeMapping v-if="(showModal && currentSelect)" @close="showModal = false" :sSeries.sync="currentSelect"></ShowEpisodeMapping>
  </div>
</template>

<script lang="ts">
import { Component, Vue, PropSync, Watch } from 'vue-property-decorator';
import App from '../App.vue';
import FrontendSeriesInfos from '../backend/controller/objects/series';
import VueLazyload from 'vue-lazyload';
import { Promised } from 'vue-promised';
import WatchProgress from '../backend/controller/objects/meta/watch-progress';
import { SeasonSearchMode } from '../backend/helpFunctions/season-helper/season-search-mode';
import { ListProviderLocalData } from '../backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ShowEpisodeMapping from './ShowEpisodeMapping.vue';
import SeriesPackage from '../backend/controller/objects/series-package';

Vue.component('Promised', Promised);
Vue.use(VueLazyload);

@Component({
	components: {
		ShowEpisodeMapping,
	},
})
export default class ListEntry extends Vue {
  @PropSync('sPackage', { type: SeriesPackage }) public seriesPackage!: SeriesPackage;
  public watchProgress: WatchProgress = new WatchProgress(0);
  public cover = '';
  public name = '?';
  public showModal = false;
  public currentSelect: FrontendSeriesInfos | null = null;
  @Watch('sPackage', { immediate: true, deep: true })
  public async onChildChanged(val: SeriesPackage, oldVal: SeriesPackage) {
  	console.log('ANIME CHANGE');
  	this.cover = val.getAnyCoverUrl();
  	this.name = await val.getPreferedName();
  	try {
  		// this.watchProgress = await val.getLastWatchProgress();
  	} catch (err) {
  		console.log(err);
  	}
  	// this.canSync = await val.getCanSyncStatus();
  }
  public constructor() {
  	super();
  }

  public clog(a: SeriesPackage) {
  	console.log(a);
  }

  public logNames(item: FrontendSeriesInfos) {
  	const animeObject = Object.assign(new FrontendSeriesInfos(), item);
  	console.log(animeObject.getAllNames());
  }

  public showMapping(item: FrontendSeriesInfos){
  	const animeObject = Object.assign(new FrontendSeriesInfos(), item);
  	this.currentSelect = animeObject;
  	this.showModal = true;
  }

  public getObjectAsString(series: FrontendSeriesInfos): string {
  	return JSON.stringify(series);
  }
  public async getWatchProgress(series: FrontendSeriesInfos): Promise<number> {
  	if (series) {
  		const animeObject: FrontendSeriesInfos = Object.assign(new FrontendSeriesInfos(), series);
  		const namen = animeObject.getAllNames();
  		try {
  			const number = await animeObject.getLastWatchProgress();
  			return number.episode;
  		} catch (err) {
        console.error(err);
      }
  	}
  	return 0;
  }

  public getProviderEpisodesCount(provider: ListProviderLocalData): number {
  	if (!provider.episodes) {
  		return -1;
  	} else {
  		return provider.episodes;
  	}
  }

  public removeSeriesPackage(seriesPackage: SeriesPackage): void {
  	App.workerController.send('delete-series-package', seriesPackage.id);
  }

  public getProviderWatchProgress(provider: ListProviderLocalData): number {
  	provider = Object.assign(new ListProviderLocalData(provider.id), provider);
  	const result = provider.getHighestWatchedEpisode();
  	if (!result) {
  		return -1;
  	} else {
  		return result.episode;
  	}
  }
  /**
   *
   */
  public updateWatchProgress(series: FrontendSeriesInfos, reduce: boolean) {
  	if (series) {
  		const div = (this.$refs as any)[
  			series.id + '-watchprogress'
  		][0] as HTMLElement;
  		if (div.textContent != null) {
  			App.workerController.send('anime-update-watch-progress', {
  				reduce,
  				series,
  			});
  		}
  	}
  }

  public syncAnime(id: string | number) {
  	App.workerController.send('sync-series', id);
  }

  public delelteData(seriesPackage: FrontendSeriesInfos) {
  	App.workerController.send('delete-series-package', seriesPackage.id);
  }

  /**
   * Collect information about the FrontendSeriesInfos.
   */
  public FrontendSeriesInfosDataRefresh(seriesPackage: FrontendSeriesInfos) {
  	App.workerController.send('request-info-refresh', seriesPackage.id);
  }

  public async getSeason(series: FrontendSeriesInfos): Promise<number | string | undefined> {
  	series = Object.assign(new FrontendSeriesInfos(), series);
  	return (await series.getSeason(SeasonSearchMode.NO_SEARCH, [])).seasonNumbers[0];
  }
  public async canSync(series: FrontendSeriesInfos): Promise<boolean> {
  	series = Object.assign(new FrontendSeriesInfos(), series);
  	return series.getCanSync();
  }
}
</script>

<style>
.main-list-entry-content-title {
  text-align: left;
  font-size: 24px;
  font-weight: bolder;
  display: inline-flex;
}

.main-list-entry-content {
  margin: 20px;
}

.series-cover {
  height: 15vh;
  min-width: 5vw;
}
</style>
