import ExternalInformationProvider from '../../api/provider/external-information-provider';
import ExternalProvider from '../../api/provider/external-provider';
import ListProvider from '../../api/provider/list-provider';
import MultiProviderResult from '../../api/provider/multi-provider-result';
import Series from '../../controller/objects/series';
import { ProviderInfoStatus } from '../../controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status';
import ProviderLocalData from '../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderList from '../../controller/provider-controller/provider-manager/provider-list';
import logger from '../../logger/logger';
import ProviderHelper from './provider-helper';
import DownloadProviderLocalDataToTargetHelper from './provider-info-downloader/download-provider-local-data-to-target-helper';
import ProviderLocalDataWithSeasonInfo from './provider-info-downloader/provider-data-with-season-info';

export default class ProviderListHelper {
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
                    logger.error('Failed to get UserLoggedIn status from provider: ' + provider.providerName);
                    logger.error(err);
                }
            }
        }
        return relevantList;
    }

    public static async requestAllListProviderInfos(series: Series, force: boolean, target: ProviderInfoStatus): Promise<ProviderLocalDataWithSeasonInfo[]> {
        const results: ProviderLocalDataWithSeasonInfo[] = [];
        const tempSeriesCopy = Object.assign(new Series(), series);
        const currentProviders = series.getAllProviderLocalDatas();

        const providersThatNeedUpdates = await this.getProvidersThatNeedUpdates(currentProviders, target);
        for (const providerThatNeedUpdate of providersThatNeedUpdates) {
            try {
                const providerLocalData = tempSeriesCopy.getListProvidersInfos().find((x) => x.provider === providerThatNeedUpdate.providerName);
                if (providerLocalData && providerLocalData.infoStatus > target || !providerLocalData) {
                    const requestResults = await new DownloadProviderLocalDataToTargetHelper(tempSeriesCopy, providerThatNeedUpdate, ProviderInfoStatus.ADVANCED_BASIC_INFO).upgradeToTarget();
                    if (requestResults instanceof MultiProviderResult) {
                        await tempSeriesCopy.addProviderDatasWithSeasonInfos(...requestResults?.getAllProvidersWithSeason());
                        results.push(...requestResults.getAllProvidersWithSeason());
                        series.resetCache();
                        tempSeriesCopy.resetCache();
                    }
                }
            } catch (err) {
                logger.error('[ProviderHelper] requestFullProviderUpdate #2: ' + err);
            }
        }
        return results;
    }

    private static async getProvidersThatNeedUpdates(currentProviderData: ProviderLocalData[], target: ProviderInfoStatus): Promise<ExternalInformationProvider[]> {
        const allProviders = ProviderList.getAllExternalInformationProvider();
        const relevantList = await this.getAllRelevantListProviders(currentProviderData);
        const providersThatNeedsAUpdate: ExternalInformationProvider[] = [];

        for (const provider of allProviders) {
            if (relevantList.find((x) => x.providerName === provider.providerName)) {
                const currentLocalData = this.getInLocalDataListContainsThisProvider(currentProviderData, provider);
                if (currentLocalData) {
                    if (currentLocalData.infoStatus > target || !ProviderHelper.isTheLocalDataStillUpToDate(currentLocalData)) {
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

    private static getInLocalDataListContainsThisProvider(list: ProviderLocalData[], provider: ExternalProvider): ProviderLocalData | undefined {
        for (const entry of list) {
            if (entry.provider === provider.providerName) {
                return entry;
            }
        }
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
}
