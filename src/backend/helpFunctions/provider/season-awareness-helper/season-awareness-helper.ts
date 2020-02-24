import Series from '../../../controller/objects/series';
import ProviderLocalData from '../../../controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderList from '../../../controller/provider-manager/provider-list';
import logger from '../../../logger/logger';
import ProviderDataWithSeasonInfo from '../provider-info-downloader/provider-data-with-season-info';

export default class SeasonAwarenessHelper {

    public static isSeasonAware(currentProviders: ProviderDataWithSeasonInfo[]): boolean {
        let result = false;
        for (const provider of currentProviders) {
            try {
                if (SeasonAwarenessHelper.isProviderSeasonAware(provider)) {
                    result =  true;
                }
            } catch (err) {
                logger.debug(err);
            }
        }
        return result;
    }

    public static isProviderSeasonAware(provider: ProviderDataWithSeasonInfo) {
        if (!ProviderList.getExternalProviderInstance(provider.providerLocalData).hasUniqueIdForSeasons && !(provider.seasonTarget?.seasonNumbers.includes(1))) {
            return false;
        }
        return true;
    }

    public static getOtherProvidersWithSeasonAwareness(series: Series, filterOut: ProviderLocalData): ProviderLocalData[] {
        const collectedProviders: ProviderLocalData[] = [];
        const allProviders = series.getAllProviderLocalDatas();
        for (const providerLocalData of allProviders) {
            if (providerLocalData.provider !== filterOut.provider) {
                try {
                    if (ProviderList.getExternalProviderInstance(providerLocalData).hasEpisodeTitleOnFullInfo) {
                        collectedProviders.push(providerLocalData);
                    }
                } catch (err) {
                    logger.debug(err);
                }
            }
        }
        return collectedProviders;
    }
}
