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
        // if (this.canUpdateSeries(series) || force) {
        let currentProviders = series.getAllProviderLocalDatas();
        const infoProvidersThatNeedUpdates = await this.getInfoProviderThatNeedUpdates(currentProviders);
        const tempSeriesCopy = Object.assign(new Series(), series);
        for (const infoProvider of infoProvidersThatNeedUpdates) {
            const result = await this.requestProviderInfo(tempSeriesCopy, infoProvider, force, target);
            await series.addProviderDatas(...result);
        }
        currentProviders = series.getAllProviderLocalDatas();

        const providersThatNeedUpdates = await this.getProvidersThatNeedUpdates(currentProviders, target);
        for (const providerThatNeedUpdate of providersThatNeedUpdates) {
            const result = await this.requestProviderInfo(tempSeriesCopy, providerThatNeedUpdate, force, ProviderInfoStatus.ADVANCED_BASIC_INFO);
            await series.addProviderDatas(...result);
        }
        series.lastInfoUpdate = Date.now();
        // }
        return series;
    }

    /**
     * requestProviderInfo
     */
    public async requestProviderInfo(series: Series, provider: ExternalProvider, force: boolean, target: ProviderInfoStatus): Promise<ProviderLocalData[]> {
        const localDatas: ProviderLocalData[] = [];
        const idProviders = await this.getAvaibleProvidersThatCanProvideProviderId(series.getAllProviderLocalDatas(), provider);
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
    public async getAllRelevantListProviders(): Promise<ListProvider[]> {
        const relevantList: ListProvider[] = [];
        for (const provider of ProviderList.getListProviderList()) {
            try {
                if (await provider.isUserLoggedIn()) {
                    relevantList.push(provider);
                }
            } catch (err) {
                logger.error(err);
            }
        }
        return relevantList;
    }

    private canUpdateSeries(series: Series): boolean {
        const daysLastUpdate = dateHelper.differenceBetweenTwoDatesInDays(new Date(series.lastInfoUpdate), new Date());
        if (daysLastUpdate > 30) {
            return true;
        }
        return false;
    }

    private async getInfoProviderThatNeedUpdates(currentProviders: ProviderLocalData[]): Promise<ExternalProvider[]> {
        const allInfoProviders = ProviderList.getInfoProviderList();
        const infoProviderThatNeedUpdate: ExternalProvider[] = [];
        for (const provider of allInfoProviders) {
            let isProviderAlreadyUpToDate = false;
            for (const currentProvider of currentProviders) {
                if (currentProvider.provider === provider.providerName) {
                    if (await this.isTheLocalDataStillUpToDate(currentProvider)) {
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
        const relevantList = await this.getAllRelevantListProviders();
        const providersThatNeedsAUpdate: ExternalProvider[] = [];
        for (const provider of allProviders) {
            if (relevantList.find((x) => x.providerName === provider.providerName)) {
                const currentLocalData = await this.getInLocalDataListContainsThisProvider(currentProviderData, provider);
                if (currentLocalData) {
                    if (currentLocalData.infoStatus < target || !await this.isTheLocalDataStillUpToDate(currentLocalData)) {
                        providersThatNeedsAUpdate.push(provider);
                    }
                } else {
                    providersThatNeedsAUpdate.push(provider);
                }
            }
        }
        return providersThatNeedsAUpdate;
    }

    private async isTheLocalDataStillUpToDate(localData: ProviderLocalData): Promise<boolean> {
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



    private async getInLocalDataListContainsThisProvider(list: ProviderLocalData[], provider: ExternalProvider): Promise<ProviderLocalData | undefined> {
        for (const entry of list) {
            if (entry.provider === provider.providerName) {
                return entry;
            }
        }
    }

    private async getAvaibleProvidersThatCanProvideProviderId(avaibleProviders: ProviderLocalData[], targetProvider: ExternalProvider): Promise<ExternalProvider[]> {
        const result: ExternalProvider[] = [];
        for (const provider of avaibleProviders) {
            if (provider.provider !== targetProvider.providerName) {
                if (await this.canGetTargetIdFromCurrentProvider(provider, targetProvider)) {
                    try {
                        const instance = ProviderList.getExternalProviderInstance(provider);
                        result.push(instance);
                    } catch (err) {
                        logger.error(err);
                    }
                }
            }
        }
        return result;
    }

    private async canGetTargetIdFromCurrentProvider(currentProvider: ProviderLocalData, targetProvider: ExternalProvider) {
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
