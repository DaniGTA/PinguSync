import ExternalProvider from '../../api/provider/external-provider';
import ListProvider from '../../api/provider/list-provider';
import MultiProviderResult from '../../api/provider/multi-provider-result';
import Series from '../../controller/objects/series';
import { ProviderInfoStatus } from '../../controller/provider-manager/local-data/interfaces/provider-info-status';
import ProviderLocalData from '../../controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderList from '../../controller/provider-manager/provider-list';
import logger from '../../logger/logger';
import dateHelper from '../date-helper';
import providerInfoDownloaderhelper from './provider-info-downloader/provider-info-downloaderhelper';


export class ProviderHelper {

    public async requestFullProviderUpdate(series: Series, target: ProviderInfoStatus = ProviderInfoStatus.BASIC_INFO, force = false): Promise<Series> {
        if (this.canUpdateSeries(series) || force) {

            const hadSeriesNames = this.hasSeriesASeriesNames(series);
            if (hadSeriesNames) {
                const infoProviders = await this.requestAllInfoProviderInfos(series, force, target);
                await series.addProviderDatas(...infoProviders);
            }

            const listProviders = await this.requestAllListProviderInfos(series, force, target);
            await series.addProviderDatas(...listProviders);

            if (!hadSeriesNames) {
                const infoProviders = await this.requestAllInfoProviderInfos(series, force, target);
                await series.addProviderDatas(...infoProviders);
            }

            series.lastInfoUpdate = Date.now();
        }
        return series;
    }

    /**
     * requestProviderInfo
     */
    public async requestProviderInfo(series: Series, provider: ExternalProvider, force: boolean, target: ProviderInfoStatus): Promise<ProviderLocalData[]> {
        const localDatas: ProviderLocalData[] = [];
        const idProviders = this.getAvaibleProvidersThatCanProvideProviderId(series.getAllProviderLocalDatas(), provider);
        for (const idProvider of idProviders) {
            try {
                const idProviderResult = await providerInfoDownloaderhelper.getProviderSeriesInfo(series, idProvider, ProviderInfoStatus.FULL_INFO);
                localDatas.push(...idProviderResult.getAllProviders());
                await series.addProviderDatas(...idProviderResult.getAllProviders());
            } catch (err) {
                logger.error(err);
            }
        }

        let lastLocalDataResult: ProviderLocalData | null = null;
        let currentResult: ProviderLocalData | null = null;
        let requestResult: MultiProviderResult | null = null;
        do {

            try {
                if (currentResult) {
                    lastLocalDataResult = currentResult;
                }
                requestResult = await providerInfoDownloaderhelper.getProviderSeriesInfo(series, provider, target);
                currentResult = requestResult.mainProvider;
                await series.addProviderDatas(...requestResult.getAllProviders());
            } catch (err) {
                logger.error(err);
            }
        } while (this.isProviderTargetAchievFailed(currentResult, lastLocalDataResult, target));

        if (requestResult) {
            localDatas.push(...requestResult.getAllProviders());
        }
        return localDatas;
    }

    public isProviderTargetAchievFailed(currentResult: ProviderLocalData | null, lastLocalDataResult: ProviderLocalData | null, target: ProviderInfoStatus) {
        if (lastLocalDataResult && currentResult) {
            if (currentResult.infoStatus > target) {
                if (currentResult.infoStatus !== lastLocalDataResult.infoStatus) {
                    return true;
                }
            }
        } else if (!lastLocalDataResult && currentResult) {
            if (currentResult.infoStatus > target) {
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

    private async requestAllListProviderInfos(series: Series, force: boolean, target: ProviderInfoStatus): Promise<ProviderLocalData[]> {
        const results = [];
        const tempSeriesCopy = Object.assign(new Series(), series);
        const currentProviders = series.getAllProviderLocalDatas();

        const providersThatNeedUpdates = await this.getProvidersThatNeedUpdates(currentProviders, target);
        for (const providerThatNeedUpdate of providersThatNeedUpdates) {
            try {
                const providerLocalData = tempSeriesCopy.getListProvidersInfos().find(x => x.provider === providerThatNeedUpdate.providerName);
                if (providerLocalData && providerLocalData.infoStatus > ProviderInfoStatus.ADVANCED_BASIC_INFO || !providerLocalData) {
                    const result = await this.requestProviderInfo(tempSeriesCopy, providerThatNeedUpdate, force, ProviderInfoStatus.ADVANCED_BASIC_INFO);
                    await series.addProviderDatas(...result);
                    results.push(...result);
                }
            } catch (err) {
                logger.error('[ProviderHelper] requestFullProviderUpdate #2: ' + err);
            }
        }
        return results;
    }

    private async requestAllInfoProviderInfos(series: Series, force: boolean, target: ProviderInfoStatus): Promise<ProviderLocalData[]> {
        const results = [];
        const currentProviders = series.getAllProviderLocalDatas();
        const tempSeriesCopy = Object.assign(new Series(), series);
        const infoProvidersThatNeedUpdates = this.getInfoProviderThatNeedUpdates(currentProviders);
        for (const infoProvider of infoProvidersThatNeedUpdates) {
            try {
                const result = await this.requestProviderInfo(tempSeriesCopy, infoProvider, force, target);
                await series.addProviderDatas(...result);
                results.push(...result);
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
}
