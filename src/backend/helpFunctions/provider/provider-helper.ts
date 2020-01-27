import ExternalProvider from '../../api/provider/external-provider';
import ListProvider from '../../api/provider/list-provider';
import MultiProviderResult from '../../api/provider/multi-provider-result';
import MainListAdder from '../../controller/main-list-manager/main-list-adder';
import Season from '../../controller/objects/meta/season';
import Series from '../../controller/objects/series';
import { InfoProviderLocalData } from '../../controller/provider-manager/local-data/info-provider-local-data';
import { ProviderInfoStatus } from '../../controller/provider-manager/local-data/interfaces/provider-info-status';
import ProviderLocalData from '../../controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderList from '../../controller/provider-manager/provider-list';
import logger from '../../logger/logger';
import dateHelper from '../date-helper';
import EpisodeHelper from '../episode-helper/episode-helper';
import ProviderDataWithSeasonInfo from './provider-info-downloader/provider-data-with-season-info';
import providerInfoDownloaderhelper from './provider-info-downloader/provider-info-downloaderhelper';
import { ListProviderLocalData } from 'src/backend/controller/provider-manager/local-data/list-provider-local-data';
import EpisodeRelationResult from '../episode-helper/episode-relation-result';
import season from 'node-myanimelist/typings/methods/jikan/season';
import SeasonAwarenessHelper from './season-awareness-helper';


export class ProviderHelper {

    public async requestFullProviderUpdate(series: Series, target: ProviderInfoStatus = ProviderInfoStatus.BASIC_INFO, force = false): Promise<Series> {
        if (this.canUpdateSeries(series) || force) {
            const seasonAware = this.isSeasonAware(series.getAllProviderLocalDatasWithSeasonInfo());

            const hadSeriesNames = this.hasSeriesASeriesNames(series);
            if (!hadSeriesNames) {
                const upgradedinfos = await this.requestUpgradeAllCurrentinfos(series, force);
                await series.addProviderDatasWithSeasonInfos(...upgradedinfos);
            }
            const infoProviders = await this.requestAllInfoProviderInfos(series, force, target);


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

    public async requestUpgradeAllCurrentinfos(series: Series, force: boolean): Promise<ProviderDataWithSeasonInfo[]> {
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
                logger.error(err);
            }
        }
        return resultList;
    }

    /**
     * requestProviderInfo
     */
    // tslint:disable-next-line: max-line-length
    public async requestProviderInfo(series: Series, provider: ExternalProvider, force: boolean, target: ProviderInfoStatus): Promise<MultiProviderResult[]> {
        const localDatas: MultiProviderResult[] = [];
        const idProviders = this.getAvaibleProvidersThatCanProvideProviderId(series.getAllProviderLocalDatas(), provider);
        const tempSeriesCopy = Object.assign(new Series(), series);
        for (const idProvider of idProviders) {
            try {
                const idProviderResult = await providerInfoDownloaderhelper.getProviderSeriesInfo(tempSeriesCopy, idProvider);
                localDatas.push(idProviderResult);
                await tempSeriesCopy.addProviderDatasWithSeasonInfos(...idProviderResult.getAllProvidersWithSeason());
            } catch (err) {
                logger.error(err);
            }
        }

        let lastLocalDataResult: ProviderDataWithSeasonInfo | null = null;
        let currentResult: ProviderDataWithSeasonInfo | null = null;
        let requestResult: MultiProviderResult | null = null;
        do {

            try {
                if (currentResult) {
                    lastLocalDataResult = currentResult;
                }
                requestResult = await providerInfoDownloaderhelper.getProviderSeriesInfo(tempSeriesCopy, provider);
                currentResult = requestResult.mainProvider;
                await tempSeriesCopy.addProviderDatasWithSeasonInfos(...requestResult.getAllProvidersWithSeason());
            } catch (err) {
                logger.error(err);
            }
        } while (this.isProviderTargetAchievFailed(currentResult, lastLocalDataResult, target));

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
    public isProviderTargetAchievFailed(currentResult: ProviderDataWithSeasonInfo | null, lastLocalDataResult: ProviderDataWithSeasonInfo | null, target: ProviderInfoStatus) {
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
    public async getAllRelevantListProviders(currentProviderData: ProviderLocalData[] = []): Promise<ListProvider[]> {
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

    public async simpleProviderInfoRequest(currentLocalData: ProviderLocalData, providerInstance: ExternalProvider): Promise<ProviderLocalData | null> {
        try {
            if (currentLocalData && currentLocalData.infoStatus > ProviderInfoStatus.FULL_INFO || !currentLocalData) {
                const tempSeries = new Series();
                tempSeries.addProviderDatas(currentLocalData);
                const infoResult = await this.requestProviderInfo(tempSeries, providerInstance, false, ProviderInfoStatus.FULL_INFO);
                return infoResult[0].mainProvider.providerLocalData;
            }
        } catch (err) {
            logger.error(err);
        }
        return null;
    }

    private async requestAllListProviderInfos(series: Series, force: boolean, target: ProviderInfoStatus): Promise<ProviderDataWithSeasonInfo[]> {
        const results: ProviderDataWithSeasonInfo[] = [];
        const tempSeriesCopy = Object.assign(new Series(), series);
        const currentProviders = series.getAllProviderLocalDatas();

        const providersThatNeedUpdates = await this.getProvidersThatNeedUpdates(currentProviders, target);
        for (const providerThatNeedUpdate of providersThatNeedUpdates) {
            try {
                const providerLocalData = tempSeriesCopy.getListProvidersInfos().find((x) => x.provider === providerThatNeedUpdate.providerName);
                if (providerLocalData && providerLocalData.infoStatus > ProviderInfoStatus.ADVANCED_BASIC_INFO || !providerLocalData) {
                    const result = await this.requestProviderInfo(tempSeriesCopy, providerThatNeedUpdate, force, ProviderInfoStatus.ADVANCED_BASIC_INFO);
                    await series.addProviderDatasWithSeasonInfos(...result.flatMap((x) => x.getAllProvidersWithSeason()));
                    series.resetCache();
                    tempSeriesCopy.resetCache();
                    results.push(...result.flatMap((x) => x.getAllProvidersWithSeason()));
                }
            } catch (err) {
                logger.error('[ProviderHelper] requestFullProviderUpdate #2: ' + err);
            }
        }
        return results;
    }

    private async requestAllInfoProviderInfos(series: Series, force: boolean, target: ProviderInfoStatus): Promise<ProviderDataWithSeasonInfo[]> {
        const results: ProviderDataWithSeasonInfo[] = [];
        const currentProviders = series.getAllProviderLocalDatas();
        const tempSeriesCopy = Object.assign(new Series(), series);
        const infoProvidersThatNeedUpdates = this.getInfoProviderThatNeedUpdates(currentProviders);
        for (const infoProvider of infoProvidersThatNeedUpdates) {
            try {
                const result = await this.requestProviderInfo(tempSeriesCopy, infoProvider, force, target);
                await series.addProviderDatasWithSeasonInfos(...result.flatMap((x) => x.getAllProvidersWithSeason()));
                results.push(...result.flatMap((x) => x.getAllProvidersWithSeason()));
            } catch (err) {
                logger.error('[ProviderHelper] requestFullProviderUpdate #1: ' + err);
            }
        }
        return results;
    }

    private hasSeriesASeriesNames(series: Series): boolean {
        const allNames = series.getAllProviderLocalDatas().flatMap((x) => x.getAllNames());
        return allNames.length !== 0;
    }

    private canUpdateSeries(series: Series): boolean {
        const daysLastUpdate = dateHelper.differenceBetweenTwoDatesInDays(new Date(series.lastInfoUpdate), new Date());
        if (daysLastUpdate > 30) {
            return true;
        }
        return false;
    }

    private getInfoProviderThatNeedUpdates(currentProviders: ProviderLocalData[]): ExternalProvider[] {
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

    private async getProvidersThatNeedUpdates(currentProviderData: ProviderLocalData[], target: ProviderInfoStatus): Promise<ExternalProvider[]> {
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
    private sortProvidersThatNeedUpdates(a: ExternalProvider, b: ExternalProvider, currentProviderData: ProviderLocalData[]): number {
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
    private isTheLocalDataStillUpToDate(localData: ProviderLocalData): boolean {
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



    private getInLocalDataListContainsThisProvider(list: ProviderLocalData[], provider: ExternalProvider): ProviderLocalData | undefined {
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
    private getAvaibleProvidersThatCanProvideProviderId(avaibleProviders: ProviderLocalData[], targetProvider: ExternalProvider): ExternalProvider[] {
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
    private getProvidersThatCanProviderProviderId(targetProvider: ExternalProvider): ExternalProvider[] {
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
                    logger.error(err);
                }
            }
        }
        return providerThatProvidersId;
    }

    private canGetTargetIdFromCurrentProvider(currentProvider: ProviderLocalData, targetProvider: ExternalProvider): boolean {
        if (currentProvider.infoStatus !== ProviderInfoStatus.FULL_INFO) {
            for (const supportedProvider of ProviderList.getExternalProviderInstance(currentProvider).potentialSubProviders) {
                if ((supportedProvider as any).getInstance().providerName === targetProvider.providerName) {
                    return true;
                }
            }
        }
        return false;
    }

    private isSeasonAware(currentProviders: ProviderDataWithSeasonInfo[]): boolean {
        for (const provider of currentProviders) {
            try {
                if (!ProviderList.getExternalProviderInstance(provider.providerLocalData).hasUniqueIdForSeasons && provider.seasonTarget?.seasonNumber !== 1) {
                    return false;
                }
            } catch (err) {
                logger.error(err);
            }
        }
        return true;
    }
}
