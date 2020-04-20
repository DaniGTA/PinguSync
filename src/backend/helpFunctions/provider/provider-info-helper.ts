import ExternalInformationProvider from '../../api/provider/external-information-provider';
import ExternalProvider from '../../api/provider/external-provider';
import InfoProvider from '../../api/provider/info-provider';
import ListProvider from '../../api/provider/list-provider';
import MultiProviderResult from '../../api/provider/multi-provider-result';
import FailedProviderRequest from '../../controller/objects/meta/failed-provider-request';
import Series from '../../controller/objects/series';
import { ProviderInfoStatus } from '../../controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status';
import ProviderLocalData from '../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderList from '../../controller/provider-controller/provider-manager/provider-list';
import ProviderNameManager from '../../controller/provider-controller/provider-manager/provider-name-manager';
import logger from '../../logger/logger';
import EpisodeStatsHelper from '../episode-helper/episode-stats-helper';
import ProviderHelper from './provider-helper';
import DownloadProviderLocalDataToTargetHelper from './provider-info-downloader/download-provider-local-data-to-target-helper';
import ProviderLocalDataWithSeasonInfo from './provider-info-downloader/provider-data-with-season-info';
import ProviderListHelper from './provider-list-helper';

export default class ProviderInfoHelper {
    public static async requestAllInfoProviderInfos(series: Series, force: boolean, target: ProviderInfoStatus, seasonAware: boolean): Promise<ProviderLocalDataWithSeasonInfo[]> {
        const results: ProviderLocalDataWithSeasonInfo[] = [];
        const currentProviders = series.getAllProviderLocalDatas();
        const tempSeriesCopy = Object.assign(new Series(), series);
        const infoProvidersThatNeedUpdates = await this.getInfoProviderThatNeedUpdates(currentProviders);
        let hasAlreadyFullEpisodeInfo = false;
        for (const infoProvider of infoProvidersThatNeedUpdates) {
            try {
                if (seasonAware && (!hasAlreadyFullEpisodeInfo) && this.shouldUpdateProviderLocalData(infoProvider, tempSeriesCopy)) {
                    const result = await new DownloadProviderLocalDataToTargetHelper(tempSeriesCopy, infoProvider, target).upgradeToTarget();
                    if (result && result instanceof MultiProviderResult) {
                        if (infoProvider.hasEpisodeTitleOnFullInfo) {
                            hasAlreadyFullEpisodeInfo = true;
                        }
                        const allResults = result.getAllProvidersWithSeason();
                        results.push(...allResults);
                        tempSeriesCopy.addProviderDatasWithSeasonInfos(...allResults);
                    }
                }
            } catch (err) {
                if (!isNaN(err)) {
                    new FailedProviderRequest(infoProvider, err);
                }
                logger.error('[ProviderHelper] requestFullProviderUpdate #1: ' + err);
            }
        }
        return results;
    }

    private static shouldUpdateProviderLocalData(provider: ExternalProvider, series: Series): boolean {
        const providerLocalData = series.getListProvidersInfos().find((x) => x.provider === provider.providerName);
        if (!providerLocalData) {
            return true;
        } else if (ProviderHelper.isTheLocalDataStillUpToDate(providerLocalData)) {
            return true;
        }
        return false;
    }


    private static async getInfoProviderThatNeedUpdates(currentProviders: ProviderLocalData[]): Promise<ExternalInformationProvider[]> {
        const allInfoProviders = ProviderList.getInfoProviderList();
        const allRelevantListProviders = await ProviderListHelper.getAllRelevantListProviders();
        const infoProviderThatNeedUpdate: ExternalInformationProvider[] = [];
        if (this.needInfoProviders(currentProviders)) {
            for (const provider of allInfoProviders) {
                let isProviderAlreadyUpToDate = false;
                for (const currentProvider of currentProviders) {
                    if (currentProvider.provider === provider.providerName) {
                        if (ProviderHelper.isTheLocalDataStillUpToDate(currentProvider)) {
                            isProviderAlreadyUpToDate = true;
                        }
                        break;
                    }
                }

                if (provider.hasEpisodeTitleOnFullInfo) {
                    infoProviderThatNeedUpdate.push(provider);
                    continue;
                }

                if (!isProviderAlreadyUpToDate) {
                    infoProviderThatNeedUpdate.push(provider);
                    continue;
                }
                if (this.itSupportProviders(provider, allRelevantListProviders)) {
                    infoProviderThatNeedUpdate.push(provider);
                    continue;
                }
            }
        }
        return infoProviderThatNeedUpdate;
    }

    private static needInfoProviders(currentProviders: ProviderLocalData[]): boolean {
        const allNonSeasonAwareProviderLocalDatas = [];
        const allSeasonAwareProviderLocalDatas = [];
        for (const currentProvider of currentProviders) {
            try {
                const instance = ProviderList.getProviderInstanceByLocalData(currentProvider);
                if (instance.hasUniqueIdForSeasons) {
                    allSeasonAwareProviderLocalDatas.push(currentProvider);
                } else {
                    allNonSeasonAwareProviderLocalDatas.push(currentProvider);
                }
            } catch (err) {
                logger.debug('[ProviderInfoHelper]: Cant get instance from provider: ' + currentProvider.provider);
                logger.debug(err);
            }
        }
        const maxEpisodeNumber = this.getFromAllProviderLocalDataMaxEpisodeNumber(allNonSeasonAwareProviderLocalDatas);
        const maxSeasonNumber: number = this.getFromAllProviderLocalDataMaxSeasonNumber(allNonSeasonAwareProviderLocalDatas);

        if (maxSeasonNumber !== 1) {
            return true;
        }

        const secondMaxSeasonNumber = this.getFromAllProviderLocalDataMaxEpisodeNumber(allSeasonAwareProviderLocalDatas);
        if (maxEpisodeNumber === secondMaxSeasonNumber) {
            return false;
        }

        return true;

    }
    private static getFromAllProviderLocalDataMaxSeasonNumber(allProviderLocalData: ProviderLocalData[]): number {
        let maxSeasonNumber = 0;
        for (const nonSeasonAwareProviderLocalData of allProviderLocalData) {
            try {
                const seasonNumber = EpisodeStatsHelper.getMaxSeasonNumberFromEpisodeList(nonSeasonAwareProviderLocalData.detailEpisodeInfo);
                if (maxSeasonNumber < seasonNumber) {
                    maxSeasonNumber = seasonNumber;
                }
            } catch (err) {
                logger.error(err);
            }
        }
        return maxSeasonNumber;
    }

    private static getFromAllProviderLocalDataMaxEpisodeNumber(allProviderLocalData: ProviderLocalData[]): number {
        let maxEpisodeNumber = 0;

        for (const nonSeasonAwareProviderLocalData of allProviderLocalData) {
            try {
                const episodeNumber = EpisodeStatsHelper.getMaxEpisodeNumber(nonSeasonAwareProviderLocalData);
                if (maxEpisodeNumber < episodeNumber) {
                    maxEpisodeNumber = episodeNumber;
                }
            } catch (err) {
                logger.error(err);
            }
        }

        return maxEpisodeNumber;
    }

    private static itSupportProviders(provider: InfoProvider, checkIfSupported: ListProvider[]) {
        for (const allRelevantListProvider of checkIfSupported) {
            for (const providerOther of provider.supportedOtherProvider) {
                if (allRelevantListProvider.providerName === ProviderNameManager.getProviderName(providerOther)) {
                    return true;
                }
            }
            for (const providerSub of provider.potentialSubProviders) {
                if (allRelevantListProvider.providerName === ProviderNameManager.getProviderName(providerSub)) {
                    return true;
                }
            }
        }
        return false;
    }
}
