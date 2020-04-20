import logger from '../../../../backend/logger/logger';
import MultiProviderResult from '../../../api/provider/multi-provider-result';
import Season from '../../../controller/objects/meta/season';
import Series from '../../../controller/objects/series';
import { ProviderInfoStatus } from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status';
import ProviderLocalData from '../../../controller/provider-controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderList from '../../../controller/provider-controller/provider-manager/provider-list';
import EpisodeRelationAnalyser from '../../episode-helper/episode-relation-analyser';
import ProviderHelper from '../provider-helper';
import DownloadProviderLocalDataToTargetHelper from '../provider-info-downloader/download-provider-local-data-to-target-helper';
import SeasonAwarenessHelper from './season-awareness-helper';

export default class SeasonAwarenessFindSeasonNumber {
    public static async  getSeasonForProvider(series: Series, localData: ProviderLocalData): Promise<Season> {
        const externalProviderInstance = ProviderList.getProviderInstanceByLocalData(localData);
        if (localData) {
            if (externalProviderInstance.hasEpisodeTitleOnFullInfo) {
                return this.searchSeasonForProvider(series, localData);
            }
        }
        throw new Error('Provider local data not existing in series (at SeasonAwarenessFindSeasonNumber.getSeasonForProvider)');
    }

    private static async searchSeasonForProvider(series: Series, existingLocalDataProvider: ProviderLocalData): Promise<Season> {
        const otherProviders = SeasonAwarenessHelper.getOtherProvidersWithSeasonAwareness(series, existingLocalDataProvider);
        for (let otherProvider of otherProviders) {
            const providerInstance = ProviderList.getProviderInstanceByLocalData(otherProvider);
            try {
                if (otherProvider.detailEpisodeInfo.length === 0) {
                    const maybeFullInfoResult =
                        await new DownloadProviderLocalDataToTargetHelper(series, providerInstance, ProviderInfoStatus.FULL_INFO).upgradeToTarget();
                    if (maybeFullInfoResult instanceof MultiProviderResult) {
                        otherProvider = maybeFullInfoResult.mainProvider.providerLocalData;
                        series.addProviderDatas(...maybeFullInfoResult.getAllProviders());
                    }
                }
                const updatedOtherProvide =
                    await ProviderHelper.simpleProviderLocalDataUpgradeRequest([otherProvider], providerInstance) as ProviderLocalData | null;
                if (updatedOtherProvide) {
                    return await this.calcSeasonForTargetProvider(series, updatedOtherProvide, existingLocalDataProvider);
                }
            } catch (err) {
                logger.error(err);
            }
        }
        throw new Error('No season found');
    }
    /**
     * TODO Should generate parts.
     * @param otherProvider where the season is present.
     * @param targetLocalDataProvider where the season is missing.
     */
    private static async calcSeasonForTargetProvider(series: Series, otherProvider: ProviderLocalData, targetLocalDataProvider: ProviderLocalData): Promise<Season> {
        const result = new EpisodeRelationAnalyser(targetLocalDataProvider.detailEpisodeInfo, otherProvider.detailEpisodeInfo);
        if (result.finalSeasonNumbers !== undefined && result.seasonComplete) {
            return new Season(result.finalSeasonNumbers);
        } else if (result.finalSeasonNumbers?.length === 1 && result.minEpisodeNumberOfSeasonHolder !== 1) {
            const prequel = await series.getPrequel();
            if (prequel.foundedSeries) {
                const prequelSeason = await this.searchSeasonForProvider(prequel.foundedSeries, targetLocalDataProvider);
                if (prequelSeason.seasonPart !== undefined) {
                    return new Season(result.finalSeasonNumbers, ++prequelSeason.seasonPart);
                }
            } else {
                const tempPrequel = await SeasonAwarenessHelper.createTempPrequelFromRelationSearchResults(prequel);
                if (tempPrequel) {
                    await tempPrequel.addProviderDatas(targetLocalDataProvider);
                    const prequelSeason = await this.searchSeasonForProvider(tempPrequel, targetLocalDataProvider);
                    if (prequelSeason.seasonPart !== undefined) {
                        return new Season(result.finalSeasonNumbers, ++prequelSeason.seasonPart);
                    }
                }
            }
        } else if (result.finalSeasonNumbers?.length === 1 && result.minEpisodeNumberOfSeasonHolder === 1) {
            return new Season(result.finalSeasonNumbers, 1);
        } else {
            logger.error('SEASON IS NOT COMPLETE CANT EXTRACT SEASON NUMBER !!!');
            throw new Error('Failed to get Season');
        }
        throw new Error('Failed to calc season for target provider: ' + targetLocalDataProvider.provider);
    }


}
