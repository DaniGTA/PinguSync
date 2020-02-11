import ExternalProvider from '../../api/provider/external-provider';
import ListProvider from '../../api/provider/list-provider';
import MultiProviderResult from '../../api/provider/multi-provider-result';
import Series from '../../controller/objects/series';
import { ProviderInfoStatus } from '../../controller/provider-manager/local-data/interfaces/provider-info-status';
import ProviderLocalData from '../../controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderList from '../../controller/provider-manager/provider-list';
import logger from '../../logger/logger';
import dateHelper from '../date-helper';
import seasonHelper from '../season-helper/season-helper';
import ProviderDataWithSeasonInfo from './provider-info-downloader/provider-data-with-season-info';
import providerInfoDownloaderhelper from './provider-info-downloader/provider-info-downloaderhelper';
import SeasonAwarenessHelper from './season-awareness-helper/season-awareness-helper';
import SeasonAwarenessFindSeasonNumber from './season-awareness-helper/season-awareness-find-season-number';


export default class ProviderHelper {

    public static hasSeriesProvider(series: Series, provider: ExternalProvider): boolean {
        return series.getAllProviderLocalDatas().findIndex((existingProvider) => existingProvider.provider === provider.providerName) !== -1;
    }

    public static async requestFullProviderUpdate(series: Series, target: ProviderInfoStatus = ProviderInfoStatus.BASIC_INFO, force = false): Promise<Series> {
        if (this.canUpdateSeries(series) || force) {
            const seasonAware = SeasonAwarenessHelper.isSeasonAware(series.getAllProviderLocalDatasWithSeasonInfo());

            const hadSeriesNames = this.hasSeriesASeriesNames(series);
            if (!hadSeriesNames) {
                const upgradedinfos = await this.requestUpgradeAllCurrentinfos(series, force);
                await series.addProviderDatasWithSeasonInfos(...upgradedinfos);
            }
            const infoProviders = await this.requestAllInfoProviderInfos(series, force, target, seasonAware);


            if (!seasonAware) {
                const instance = new SeasonAwarenessHelper(series, infoProviders);
                const providers = await instance.requestSeasonAwareness();
                await series.addProviderDatasWithSeasonInfos(...providers);
            } else {
                await series.addProviderDatasWithSeasonInfos(...infoProviders);
            }

            const listProviders = await this.requestAllListProviderInfos(series, force, target);
            await series.addProviderDatasWithSeasonInfos(...listProviders);

            series.lastInfoUpdate = Date.now();
        }
        return series;
    }

    public static async requestUpgradeAllCurrentinfos(series: Series, force: boolean): Promise<ProviderDataWithSeasonInfo[]> {
        const resultList: ProviderDataWithSeasonInfo[] = [];
        const providerLocalDatas = series.getAllProviderLocalDatas();
        for (const providerLocalData of providerLocalDatas) {
            try {
                if (providerLocalData && providerLocalData.infoStatus > ProviderInfoStatus.FULL_INFO || !providerLocalData) {
                    const providerInstance = ProviderList.getExternalProviderInstance(providerLocalData);
                    const infoResult = await this.requestProviderInfo(series, providerInstance, force, ProviderInfoStatus.FULL_INFO);
                    resultList.push(...infoResult.flatMap((x) => x.getAllProvidersWithSeason()));
                }
            } catch (err) {
                logger.error('Error at ProviderHelper.requestUpgradeAllCurrentinfos');
                logger.error(err);
            }
        }
        return resultList;
    }

    /**
     * requestProviderInfo
     */
    // tslint:disable-next-line: max-line-length
    public static async requestProviderInfo(series: Series, provider: ExternalProvider, force: boolean, target: ProviderInfoStatus): Promise<MultiProviderResult[]> {
        logger.debug('Start request for Provider: ')
        const localDatas: MultiProviderResult[] = [];
        const idProviders = this.getAvaibleProvidersThatCanProvideProviderId(series.getAllProviderLocalDatas(), provider);
        const tempSeriesCopy = Object.assign(new Series(), series);
        for (const idProvider of idProviders) {
            try {
                const idProviderResult = await providerInfoDownloaderhelper.downloadProviderSeriesInfo(tempSeriesCopy, idProvider);
                localDatas.push(idProviderResult);
                await tempSeriesCopy.addProviderDatasWithSeasonInfos(...idProviderResult.getAllProvidersWithSeason());
            } catch (err) {
                logger.error('Error at ProviderHelper.requestProviderInfo');
                logger.error(err);
            }
        }

        let firstSeason: Series | null = null;
        const season = (await series.getSeason()).seasonNumber;
        if (season !== 1 && season !== undefined) {
            try {
                firstSeason = await series.getFirstSeason();
            } catch (err) {
                logger.debug(err);
            }
        }
        const requestResult = await this.requestProviderToTarget(provider, firstSeason, series, target);

        if (requestResult) {
            localDatas.push(requestResult);
        }

        if (localDatas.length === 0) {
            const providersThatCanProvideId = this.getProvidersThatCanProviderProviderId(provider);
            for (const providerThatCanProvideId of providersThatCanProvideId) {
                try {
                    const result = await this.requestProviderInfo(series, providerThatCanProvideId, force, target);
                    if (result.length !== 0) {
                        localDatas.push(...result);
                        break;
                    }
                } catch (err) {
                    logger.error(err);
                }
            }
        }
        return localDatas;
    }

    // tslint:disable-next-line: max-line-length
    public static isProviderTargetAchievFailed(currentResult: ProviderDataWithSeasonInfo | null, lastLocalDataResult: ProviderDataWithSeasonInfo | null, target: ProviderInfoStatus) {
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

    /**
     * get all List providers where the user is logged in.
     */
    public static async getAllRelevantListProviders(currentProviderData: ProviderLocalData[] = []): Promise<ListProvider[]> {
        const relevantList: ListProvider[] = [];
        for (const provider of ProviderList.getListProviderList()) {
            if (currentProviderData.find((x) => x.provider === provider.providerName)) {
                relevantList.push(provider);
            } else {
                try {
                    if (await provider.isUserLoggedIn()) {
                        relevantList.push(provider);
                    }
                } catch (err) {
                    logger.error(err);
                }
            }
        }
        return relevantList;
    }

    public static async simpleProviderInfoRequest(currentLocalData: ProviderLocalData, providerInstance: ExternalProvider): Promise<ProviderLocalData | null> {
        try {
            if (currentLocalData && currentLocalData.infoStatus > ProviderInfoStatus.FULL_INFO || !currentLocalData) {
                const tempSeries = new Series();
                await tempSeries.addProviderDatas(currentLocalData);
                const infoResult = await this.requestProviderInfo(tempSeries, providerInstance, false, ProviderInfoStatus.FULL_INFO);
                return infoResult[0].mainProvider.providerLocalData;
            }
        } catch (err) {
            logger.error(err);
        }
        return null;
    }

    private static async requestProviderToTarget(provider: ExternalProvider, firstSeason: Series | null, tempSeriesCopy: Series, target: ProviderInfoStatus) {
        let lastLocalDataResult: ProviderDataWithSeasonInfo | null = null;
        let currentResult: ProviderDataWithSeasonInfo | null = null;
        let requestResult: MultiProviderResult | null = null;
        do {
            requestResult = null;
            try {
                if (currentResult) {
                    lastLocalDataResult = currentResult;
                }
                if (firstSeason !== null) {
                    requestResult = await providerInfoDownloaderhelper.downloadProviderSeriesInfo(firstSeason, provider);
                }
                if (requestResult === null) {
                    requestResult = await providerInfoDownloaderhelper.downloadProviderSeriesInfo(tempSeriesCopy, provider);
                }
                currentResult = requestResult.mainProvider;
                await tempSeriesCopy.addProviderDatasWithSeasonInfos(...requestResult.getAllProvidersWithSeason());
            } catch (err) {
                logger.error(err);
            }
        } while (this.isProviderTargetAchievFailed(currentResult, lastLocalDataResult, target));
        return requestResult;
    }

    private static async requestAllListProviderInfos(series: Series, force: boolean, target: ProviderInfoStatus): Promise<ProviderDataWithSeasonInfo[]> {
        const results: ProviderDataWithSeasonInfo[] = [];
        const tempSeriesCopy = Object.assign(new Series(), series);
        const season = series.getSeason();
        const currentProviders = series.getAllProviderLocalDatas();

        const providersThatNeedUpdates = await this.getProvidersThatNeedUpdates(currentProviders, target);
        for (const providerThatNeedUpdate of providersThatNeedUpdates) {
            try {
                const providerLocalData = tempSeriesCopy.getListProvidersInfos().find((x) => x.provider === providerThatNeedUpdate.providerName);
                if (providerLocalData && providerLocalData.infoStatus > ProviderInfoStatus.ADVANCED_BASIC_INFO || !providerLocalData) {
                    const requestResults = await this.requestProviderInfo(tempSeriesCopy, providerThatNeedUpdate, force, ProviderInfoStatus.ADVANCED_BASIC_INFO);
                    for (const result of requestResults) {
                        try {
                            if (!providerThatNeedUpdate.hasUniqueIdForSeasons && !seasonHelper.isSeasonFirstSeason(await season) && requestResults.length !== 0) {
                                result.mainProvider.seasonTarget = await SeasonAwarenessFindSeasonNumber.getSeasonForProvider(tempSeriesCopy, result.mainProvider.providerLocalData);
                            }
                        } catch (err) {
                            logger.error(err);
                        }
                        await tempSeriesCopy.addProviderDatasWithSeasonInfos(...result.getAllProvidersWithSeason());
                        results.push(...result.getAllProvidersWithSeason())

                    }
                    series.resetCache();
                    tempSeriesCopy.resetCache();
                }
            } catch (err) {
                logger.error('[ProviderHelper] requestFullProviderUpdate #2: ' + err);
            }
        }
        return results;
    }

    private static async requestAllInfoProviderInfos(series: Series, force: boolean, target: ProviderInfoStatus, seasonAware: boolean): Promise<ProviderDataWithSeasonInfo[]> {
        const results: ProviderDataWithSeasonInfo[] = [];
        const currentProviders = series.getAllProviderLocalDatas();
        const tempSeriesCopy = Object.assign(new Series(), series);
        const infoProvidersThatNeedUpdates = this.getInfoProviderThatNeedUpdates(currentProviders);
        for (const infoProvider of infoProvidersThatNeedUpdates) {
            try {
                if (seasonAware) {
                    const result = await this.requestProviderInfo(tempSeriesCopy, infoProvider, force, target);
                    await series.addProviderDatasWithSeasonInfos(...result.flatMap((x) => x.getAllProvidersWithSeason()));
                    const allResults = result.flatMap((x) => x.getAllProvidersWithSeason());
                    results.push(...allResults);
                    tempSeriesCopy.addProviderDatasWithSeasonInfos(...allResults);
                } else {
                    const instance = new SeasonAwarenessHelper(series);
                    const result = await instance.requestSeasonAwarnessForProvider(infoProvider);
                    results.push(...result);
                    tempSeriesCopy.addProviderDatasWithSeasonInfos(...result);
                    seasonAware = true;
                }
            } catch (err) {
                logger.error('[ProviderHelper] requestFullProviderUpdate #1: ' + err);
            }
        }
        return results;
    }

    private static hasSeriesASeriesNames(series: Series): boolean {
        const allNames = series.getAllProviderLocalDatas().flatMap((x) => x.getAllNames());
        return allNames.length !== 0;
    }

    private static canUpdateSeries(series: Series): boolean {
        const daysLastUpdate = dateHelper.differenceBetweenTwoDatesInDays(new Date(series.lastInfoUpdate), new Date());
        if (daysLastUpdate > 30) {
            return true;
        }
        return false;
    }

    private static getInfoProviderThatNeedUpdates(currentProviders: ProviderLocalData[]): ExternalProvider[] {
        const allInfoProviders = ProviderList.getInfoProviderList();
        const infoProviderThatNeedUpdate: ExternalProvider[] = [];
        for (const provider of allInfoProviders) {
            let isProviderAlreadyUpToDate = false;
            for (const currentProvider of currentProviders) {
                if (currentProvider.provider === provider.providerName) {
                    if (this.isTheLocalDataStillUpToDate(currentProvider)) {
                        isProviderAlreadyUpToDate = true;
                    }
                    break;
                }
            }
            if (!isProviderAlreadyUpToDate) {
                infoProviderThatNeedUpdate.push(provider);
            }
        }
        return infoProviderThatNeedUpdate;
    }

    private static async getProvidersThatNeedUpdates(currentProviderData: ProviderLocalData[], target: ProviderInfoStatus): Promise<ExternalProvider[]> {
        const allProviders = ProviderList.getAllProviderLists();
        const relevantList = await this.getAllRelevantListProviders(currentProviderData);
        const providersThatNeedsAUpdate: ExternalProvider[] = [];

        for (const provider of allProviders) {
            if (relevantList.find((x) => x.providerName === provider.providerName)) {
                const currentLocalData = this.getInLocalDataListContainsThisProvider(currentProviderData, provider);
                if (currentLocalData) {
                    if (currentLocalData.infoStatus > target || !this.isTheLocalDataStillUpToDate(currentLocalData)) {
                        providersThatNeedsAUpdate.push(provider);
                    }
                } else {
                    providersThatNeedsAUpdate.push(provider);
                }
            }
        }
        providersThatNeedsAUpdate.sort((a, b) => this.sortProvidersThatNeedUpdates(a, b, currentProviderData));
        return providersThatNeedsAUpdate;
    }
    /**
     * @test should sort provider that need updates right
     * @param a
     * @param b
     * @param currentProviderData
     */
    private static sortProvidersThatNeedUpdates(a: ExternalProvider, b: ExternalProvider, currentProviderData: ProviderLocalData[]): number {
        const isAInList = currentProviderData.find((x) => x.provider === a.providerName);
        const isBInList = currentProviderData.find((x) => x.provider === b.providerName);
        if (isAInList) {
            return -1;
        } else if (isBInList) {
            return 1;
        }
        return 0;
    }
    /**
     * Checks if the localdata is not older then 30 days.
     * And it checks if the version has changed
     * @param localData the localdata that should be checked
     */
    private static isTheLocalDataStillUpToDate(localData: ProviderLocalData): boolean {
        try {
            const instance = ProviderList.getExternalProviderInstance(localData);
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



    private static getInLocalDataListContainsThisProvider(list: ProviderLocalData[], provider: ExternalProvider): ProviderLocalData | undefined {
        for (const entry of list) {
            if (entry.provider === provider.providerName) {
                return entry;
            }
        }
    }

    /**
     * Get every avaible provider that can provider the id of the target provider
     * @param avaibleProviders
     * @param targetProvider
     */
    private static getAvaibleProvidersThatCanProvideProviderId(avaibleProviders: ProviderLocalData[], targetProvider: ExternalProvider): ExternalProvider[] {
        const result: ExternalProvider[] = [];
        for (const provider of avaibleProviders) {
            try {
                if (provider.provider !== targetProvider.providerName) {
                    if (this.canGetTargetIdFromCurrentProvider(provider, targetProvider)) {
                        try {
                            const instance = ProviderList.getExternalProviderInstance(provider);
                            result.push(instance);
                        } catch (err) {
                            logger.error(err);
                        }
                    }
                }
            } catch (err) {
                logger.debug(err);
            }
        }
        return result;
    }

    /**
     * Get all providers that can give the id of the target provider.
     * @param targetProvider
     */
    private static getProvidersThatCanProviderProviderId(targetProvider: ExternalProvider): ExternalProvider[] {
        const providerThatProvidersId: ExternalProvider[] = [];
        for (const provider of ProviderList.getAllProviderLists()) {
            for (const supportProvider of provider.potentialSubProviders) {
                try {
                    const instance = (supportProvider as any).getInstance();
                    if (instance.getInstance().providerName === targetProvider.providerName) {
                        providerThatProvidersId.push(instance);
                        break;
                    }
                } catch (err) {
                    logger.debug(err);
                }
            }
        }
        return providerThatProvidersId;
    }

    private static canGetTargetIdFromCurrentProvider(currentProvider: ProviderLocalData, targetProvider: ExternalProvider): boolean {
        if (currentProvider.infoStatus !== ProviderInfoStatus.FULL_INFO) {
            for (const supportedProvider of ProviderList.getExternalProviderInstance(currentProvider).potentialSubProviders) {
                try {
                    if ((supportedProvider as any).getInstance().providerName === targetProvider.providerName) {
                        return true;
                    }
                } catch (err) {
                    logger.debug(err);
                }
            }
        }
        return false;
    }
}
