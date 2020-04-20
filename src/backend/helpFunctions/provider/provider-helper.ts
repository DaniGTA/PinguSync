import ExternalInformationProvider from '../../api/provider/external-information-provider';
import ExternalProvider from '../../api/provider/external-provider';
import MultiProviderResult from '../../api/provider/multi-provider-result';
import Series from '../../controller/objects/series';
import { ProviderInfoStatus } from '../../controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status';
import ProviderLocalData from '../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderList from '../../controller/provider-controller/provider-manager/provider-list';
import logger from '../../logger/logger';
import dateHelper from '../date-helper';
import DownloadProviderLocalDataToTargetHelper from './provider-info-downloader/download-provider-local-data-to-target-helper';
import ProviderLocalDataWithSeasonInfo from './provider-info-downloader/provider-data-with-season-info';
import ProviderMappingDownloadHelper from './provider-info-downloader/provider-mapping-download-helper';


export default class ProviderHelper {

    public static hasSeriesProvider(series: Series, provider: ExternalProvider): boolean {
        return series.getAllProviderLocalDatas().findIndex((existingProvider) => existingProvider.provider === provider.providerName) !== -1;
    }

    public static async requestUpgradeAllCurrentinfos(series: Series, force: boolean): Promise<ProviderLocalDataWithSeasonInfo[]> {
        const resultList: ProviderLocalDataWithSeasonInfo[] = [];
        const providerLocalDatas = series.getAllProviderLocalDatas();
        for (const providerLocalData of providerLocalDatas) {
            try {
                if (providerLocalData && providerLocalData.infoStatus > ProviderInfoStatus.FULL_INFO || !providerLocalData) {
                    const providerInstance = ProviderList.getProviderInstanceByLocalData(providerLocalData);
                    const infoResult = await new DownloadProviderLocalDataToTargetHelper(series, providerInstance, ProviderInfoStatus.FULL_INFO).upgradeToTarget();
                    if (infoResult && infoResult instanceof MultiProviderResult) {
                        resultList.push(...infoResult.getAllProvidersWithSeason());
                    }
                }
            } catch (err) {
                logger.error('Error at ProviderHelper.requestUpgradeAllCurrentinfos');
                logger.error(err);
            }
        }
        return resultList;
    }

    public static async requestAllMappingProvider(series: Series): Promise<ProviderLocalDataWithSeasonInfo[]> {
        const result: ProviderLocalDataWithSeasonInfo[] = [];
        const allMappingResults = await ProviderMappingDownloadHelper.getMappingForSeries(series);
        for (const mappingResult of allMappingResults) {
            result.push(...mappingResult.getAllProvidersWithSeason());
        }
        return result;
    }


    // tslint:disable-next-line: max-line-length
    public static isProviderTargetAchievFailed(currentResult: ProviderLocalDataWithSeasonInfo | null, lastLocalDataResult: ProviderLocalDataWithSeasonInfo | null, target: ProviderInfoStatus) {
        if (lastLocalDataResult && currentResult) {
            if (currentResult.providerLocalData.infoStatus > target) {
                if (currentResult.providerLocalData.infoStatus !== lastLocalDataResult.providerLocalData.infoStatus) {
                    return true;
                }
            }
        } else if (!lastLocalDataResult && currentResult) {
            if (currentResult.providerLocalData.infoStatus > target) {
                return true;
            }
        }
        return false;
    }
    public static async simpleProviderLocalDataUpgradeRequest(currentLocalDatas: ProviderLocalData[], providerInstance: ExternalInformationProvider): Promise<ProviderLocalData | undefined> {
        try {
            const tempSeries = new Series();
            await tempSeries.addProviderDatas(...currentLocalDatas);
            const currentProviderLocalData = currentLocalDatas.find((x) => x.provider === providerInstance.providerName);
            if (currentProviderLocalData?.infoStatus !== ProviderInfoStatus.FULL_INFO) {
                const infoResult = await new DownloadProviderLocalDataToTargetHelper(
                    tempSeries, providerInstance, ProviderInfoStatus.FULL_INFO).upgradeToTarget();
                if (infoResult && infoResult instanceof MultiProviderResult) {
                    for (const provider of infoResult.getAllProviders()) {
                        if (provider.provider === providerInstance.providerName) {
                            return provider;
                        }
                    }
                }
            }
        } catch (err) {
            logger.error(err);
        }
        return currentLocalDatas.find((x) => x.provider === providerInstance.providerName);
    }

    /**
     * Checks if the localdata is not older then 30 days.
     * And it checks if the version has changed
     * @param localData the localdata that should be checked
     */
    public static isTheLocalDataStillUpToDate(localData: ProviderLocalData): boolean {
        try {
            const instance = ProviderList.getProviderInstanceByLocalData(localData);
            if (instance) {
                const localDataLastUpdate = new Date(localData.lastUpdate);
                const outdate = dateHelper.addDays(localDataLastUpdate, 30);
                if (outdate.getTime() < Date.now()) {
                    logger.info('[ProviderHelper] Localdata is out of date, add localdata to update.');
                    return false;
                }
                if (localData.version !== instance.version) {
                    logger.info('[ProviderHelper] Provider version has been updatet, add localdata to update.');
                    return false;
                }
            }
        } catch (err) {
            logger.error(err);
        }
        return true;
    }
}
