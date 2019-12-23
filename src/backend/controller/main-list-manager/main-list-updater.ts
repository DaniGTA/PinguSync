import MultiProviderResult from '../../api/provider/multi-provider-result';
import logger from '../../logger/logger';
import Series from '../objects/series';
import MainListAdder from './main-list-adder';
import MainListManager from './main-list-manager';
import MainListSearcher from './main-list-searcher';
export default class MainListEntryUpdater {
    /**
     * Use ListController to add Series too the MainList.
     *
     * This just managed the Waitlist.
     * @param series
     */
    public async updateSeries(...providers: MultiProviderResult[]) {
        const searcher = new MainListSearcher();
        const notFounded: Series[] = [];
        for (const provider of providers) {
            const searchResult = await searcher.findSeriesWithMultiProviderResult(provider);
            if (searchResult) {
                await searchResult.addProviderDatas(...provider.getAllProviders());
                await MainListManager.updateSerieInList(searchResult);
            } else {
                logger.info('Add new series. Reason: Provider not found in mainlist');
                const newSeries = new Series();
                await newSeries.addProviderDatas(...provider.getAllProviders());
                notFounded.push(newSeries);
            }
        }
        if (notFounded.length !== 0) {
            await new MainListAdder().addSeries(...notFounded);
        } else {
            await MainListManager.requestSaveMainList();
        }
    }
}
