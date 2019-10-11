import MultiProviderResult from '../../api/multi-provider-result';
import ProviderComperator from '../../helpFunctions/comperators/provider-comperator';
import seriesHelper from '../../helpFunctions/series-helper';
import logger from '../../logger/logger';
import Series from '../objects/series';
import MainListManager from './main-list-manager';

/**
 * Has search function to find series in the main list.
 * ! On no results it will always return `NULL`
 */
export default class MainListSearcher {
    /**
     * Search the Series in the mainlist with the provider result values.
     *
     * Technicly it only checks: is same season ? is same id ? is same provider ?
     */
    public async findSeriesWithMultiProviderResult(providerResults: MultiProviderResult): Promise<Series | null> {
        const series = await MainListManager.getMainList();
        for (const serie of series) {
            const allProviders = serie.getAllProviderLocalDatas();
            for (const localProvider of allProviders) {
                if (await ProviderComperator.simpleProviderSameIdAndSameSeasonCheck([localProvider], providerResults.getAllProviders())) {
                    return serie;
                }
            }
        }
        return null;
    }

    /**
     * Search the Series in the mainlist with the series id.
     *
     * Technicly it only checks: is same id ?
     *
     * @param id the series id.
     */
    public async findSeriesBySeriesId(id: string): Promise<Series | null>  {
        const series = await MainListManager.getMainList();
        for (const serie of series) {
            if (serie.id === id) {
                return serie;
            }
        }
        return null;
    }

    /**
     * Search with id and it will look on other meta data if it is a same series already in the mainlist
     * @param series
     */
    public async findSameSeriesInMainList(series: Series): Promise<Series[]> {
        return this.findSameSeriesInList(series, await MainListManager.getMainList());
    }
    /**
     * Search with id and it will look on other meta data if it is a same series already in the mainlist
     * @param series
     */
    public async quickFindSameSeriesInMainList(series: Series): Promise<Series[]> {
        return this.quickFindSameSeriesInList(series, await MainListManager.getMainList());
    }

    public async findSameSeriesInList(entry: Series, list: Series[]): Promise<Series[]> {
       logger.log('info', '[Search] Find search series in list of size: ' + list.length);
       const foundedSameSeries = [];
       for (const listEntry of list) {
            if (listEntry.id === entry.id) {
                foundedSameSeries.push(listEntry);
            } else {
                if (await seriesHelper.isSameSeries(listEntry, entry)) {
                    foundedSameSeries.push(listEntry);
                }
            }
        }
       logger.log('info', 'Found: ' + foundedSameSeries.length);
       return foundedSameSeries;
    }

    private async quickFindSameSeriesInList(entry: Series, list: Series[]): Promise<Series[]> {
        logger.log('info', '[Search] Quick find search series in list of size: ' + list.length);
        const foundedSameSeries = [];
        for (const listEntry of list) {
            if (listEntry.id === entry.id) {
                foundedSameSeries.push(listEntry);
            }
            if (await ProviderComperator.simpleProviderSameIdAndSameSeasonCheckOnSeries(entry, listEntry)) {
                foundedSameSeries.push(listEntry);
            }
        }
        logger.log('info', 'Found: ' + foundedSameSeries.length);
        return foundedSameSeries;
    }
}
