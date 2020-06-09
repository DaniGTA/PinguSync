import logger from '../../logger/logger';
import MultiProviderResult from '../../api/provider/multi-provider-result';
import MainListEntryUpdater from '../main-list-manager/main-list-updater';
import ProviderList from '../provider-controller/provider-manager/provider-list';

export default class SyncSeries {
    public static async updateLocalSeriesListWithAllProviders(): Promise<void> {
        logger.log('info', '[calc] -> SeriesList');
        const allSeries: MultiProviderResult[] = await this.getAllEntrysFromProviders(true);
        await new MainListEntryUpdater().updateSeries(...allSeries);
    }


    public static async getAllEntrysFromProviders(forceDownload = false): Promise<MultiProviderResult[]> {
        const multiProviderResults: MultiProviderResult[] = [];
        for (const provider of ProviderList.getListProviderList()) {
            try {
                if (await provider.isUserLoggedIn()) {
                    logger.log('info', '[Request] -> ' + provider.providerName + ' -> AllSeries');
                    const allSeries = await provider.getAllSeries(forceDownload);
                    for (const iterator of allSeries) {
                        multiProviderResults.push(iterator);
                    }
                    logger.log('info', '[Request] -> result: ' + allSeries.length + ' items');

                }
            } catch (err) {
                logger.error('[Error] -> ' + provider.providerName + ' -> AllSeries');
                logger.error(err);
            }
        }
        return multiProviderResults;
    }
}