import MultiProviderResult from '../../api/provider/multi-provider-result';
import ProviderComperator from '../../helpFunctions/comperators/provider-comperator';
import seriesHelper from '../../helpFunctions/series-helper';
import logger from '../../logger/logger';
import Series from '../objects/series';
import MainListManager from './main-list-manager';
import { AbsoluteResult } from '../../helpFunctions/comperators/comperator-results.ts/comperator-result';

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
        logger.debug('serch series with multiprovider result');
        const series = await MainListManager.getMainList();
        for (const serie of series) {
            try {
                const allProviders = serie.getAllProviderLocalDatas();
                if (await ProviderComperator.simpleProviderSameIdAndSameSeasonCheckWithSeries(allProviders, providerResults.getAllProviders(), serie)) {
                    logger.debug('serch series with multiprovider result: FOUND');
                    return serie;
                }
            } catch (err) {
                logger.warn(err);
            }
        }
        logger.debug('serch series with multiprovider result: NOT FOUND');
        return null;
    }

    /**
     * Search the Series in the mainlist with the series id.
     *
     * Technicly it only checks: is same id ?
     *
     * @param id the series id.
     */
    public async findSeriesBySeriesId(id: string): Promise<Series | null> {
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
        logger.log('debug', '[Search] Quick find search series in list of size: ' + list.length);
        const foundedSameSeries = [];
        for (const listEntry of list) {
            if (listEntry.id === entry.id) {
                foundedSameSeries.push(listEntry);
                break;
            }
            const providerComperator = new ProviderComperator(entry, listEntry);
            const providerResult = await providerComperator.getCompareResult();
            if (providerResult.isAbsolute === AbsoluteResult.ABSOLUTE_TRUE) {
                foundedSameSeries.push(listEntry);
            }
        }
        logger.log('debug', 'Found: ' + foundedSameSeries.length);
        return foundedSameSeries;
    }
}
