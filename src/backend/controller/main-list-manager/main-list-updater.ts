import MultiProviderResult from '../../api/provider/multi-provider-result';
import Series from '../objects/series';
import MainListAdder from './main-list-adder';
import MainListSearcher from './main-list-searcher';
import ProviderLocalDataWithSeasonInfo from '../../helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import MainListManager from './main-list-manager';
import EpisodeMappingHelper from '../../helpFunctions/episode-mapping-helper/episode-mapping-helper';
export default class MainListEntryUpdater {
    /**
     * Use ListController to add Series too the MainList.
     *
     * This just managed the Waitlist.
     * @param series
     */
    public async updateMultiProviderData(...providers: MultiProviderResult[]): Promise<void> {
        const notFounded: Series[] = [];
        for (const provider of providers) {
            const currentSeries = MainListSearcher.findSeriesWithMultiProviderResult(provider);
            if (currentSeries) {
                for (const singleProvider of provider.getAllProvidersWithSeason()) {
                    await this.updateSingleProviderData(singleProvider, currentSeries);
                }
            } else {
                const newSeries = new Series();
                await newSeries.addProviderDatasWithSeasonInfos(...provider.getAllProvidersWithSeason());
                notFounded.push(newSeries);
            }
        }
        await new MainListAdder().addSeries(...notFounded);
    }

    public async updateSingleProviderData(provider: ProviderLocalDataWithSeasonInfo, series: Series): Promise<void> {
        const oldProvider = series.getProviderLocalDataWithSeasonInfoByProviderName(provider.providerLocalData.provider);
        await series.addProviderDatasWithSeasonInfos(provider);
        if (oldProvider?.providerLocalData.detailEpisodeInfo.length !== provider.providerLocalData.detailEpisodeInfo.length) {
            const instance = await EpisodeMappingHelper.getEpisodeMappings(series);
            series.addEpisodeBindingPools(...instance);
        }
        MainListManager.updateSerieInList(series);
    }
}
