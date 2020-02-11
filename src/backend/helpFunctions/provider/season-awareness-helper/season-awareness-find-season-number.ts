import Series from '../../../controller/objects/series';
import Season from '../../../controller/objects/meta/season';
import SeasonAwarenessHelper from './season-awareness-helper';
import ProviderHelper from '../provider-helper';
import ProviderList from '../../../controller/provider-manager/provider-list';
import ProviderLocalData from '../../../controller/provider-manager/local-data/interfaces/provider-local-data';
import EpisodeHelper from '../../episode-helper/episode-helper';
import logger from '../../../../backend/logger/logger';

export default class SeasonAwarenessFindSeasonNumber {
    public static async  getSeasonForProvider(series: Series, localData: ProviderLocalData): Promise<Season> {
        const externalProviderInstance = ProviderList.getExternalProviderInstance(localData);
        if (localData) {
            if (externalProviderInstance.hasEpisodeTitleOnFullInfo) {
                return this.searchSeasonForProvider(series, localData);
            }
        }
        throw new Error('Provider local data not existing in series (at SeasonAwarenessFindSeasonNumber.getSeasonForProvider)')
    }

    private static async searchSeasonForProvider(series: Series, existingLocalDataProvider: ProviderLocalData): Promise<Season> {
        const otherProviders = SeasonAwarenessHelper.getOtherProvidersWithSeasonAwareness(series, existingLocalDataProvider);
        for (const otherProvider of otherProviders) {
            try {
                const providerInstance = ProviderList.getExternalProviderInstance(otherProvider);
                const updatedOtherProvide = await ProviderHelper.simpleProviderInfoRequest(otherProvider, providerInstance) as ProviderLocalData | null;
                if (updatedOtherProvide) {
                    return this.calcSeasonForTargetProvider(updatedOtherProvide, existingLocalDataProvider);
                }
            } catch (err) {
                logger.error(err);
            }
        }
        throw new Error('No season found');
    }

    private static calcSeasonForTargetProvider(otherProvider: ProviderLocalData, targetLocalDataProvider: ProviderLocalData): Season {
        const result = EpisodeHelper.calculateRelationBetweenEpisodes(targetLocalDataProvider.detailEpisodeInfo, otherProvider.detailEpisodeInfo);
        if (result.seasonComplete) {
            return new Season(result.seasonNumber);
        } else {
            logger.error('SEASON IS NOT COMPLETE CANT EXTRACT SEASON NUMBER !!!');
            throw new Error('Failed to get Season');
        }
    }


}
