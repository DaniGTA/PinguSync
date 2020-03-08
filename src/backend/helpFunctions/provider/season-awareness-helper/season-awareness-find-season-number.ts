import logger from '../../../../backend/logger/logger';
import Season from '../../../controller/objects/meta/season';
import Series from '../../../controller/objects/series';
import ProviderLocalData from '../../../controller/provider-manager/local-data/interfaces/provider-local-data';
import ProviderList from '../../../controller/provider-manager/provider-list';
import EpisodeHelper from '../../episode-helper/episode-helper';
import ProviderHelper from '../provider-helper';
import SeasonAwarenessHelper from './season-awareness-helper';

export default class SeasonAwarenessFindSeasonNumber {
    public static async  getSeasonForProvider(series: Series, localData: ProviderLocalData): Promise<Season> {
        const externalProviderInstance = ProviderList.getExternalProviderInstance(localData);
        if (localData) {
            if (externalProviderInstance.hasEpisodeTitleOnFullInfo) {
                return this.searchSeasonForProvider(series, localData);
            }
        }
        throw new Error('Provider local data not existing in series (at SeasonAwarenessFindSeasonNumber.getSeasonForProvider)');
    }

    private static async searchSeasonForProvider(series: Series, existingLocalDataProvider: ProviderLocalData): Promise<Season> {
        const otherProviders = SeasonAwarenessHelper.getOtherProvidersWithSeasonAwareness(series, existingLocalDataProvider);
        for (const otherProvider of otherProviders) {
            try {
                const providerInstance = ProviderList.getExternalProviderInstance(otherProvider);
                const updatedOtherProvide = await ProviderHelper.simpleProviderInfoRequest([otherProvider], providerInstance) as ProviderLocalData | null;
                if (updatedOtherProvide) {
                    return this.calcSeasonForTargetProvider(updatedOtherProvide, existingLocalDataProvider);
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
    private static calcSeasonForTargetProvider(otherProvider: ProviderLocalData, targetLocalDataProvider: ProviderLocalData): Season {
        const result = EpisodeHelper.calculateRelationBetweenEpisodes(targetLocalDataProvider.detailEpisodeInfo, otherProvider.detailEpisodeInfo);
        if (result.seasonNumber !== undefined && result.seasonComplete) {
            return new Season(result.seasonNumber);
        } else if (result.seasonNumber?.length === 1) {

        } else {
            logger.error('SEASON IS NOT COMPLETE CANT EXTRACT SEASON NUMBER !!!');
            throw new Error('Failed to get Season');
        }
    }
}
