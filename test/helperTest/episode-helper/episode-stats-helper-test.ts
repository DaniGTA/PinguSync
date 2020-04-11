import { strictEqual } from 'assert';
import Episode from '../../../src/backend/controller/objects/meta/episode/episode';
import Season from '../../../src/backend/controller/objects/meta/season';
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import EpisodeStatsHelper from '../../../src/backend/helpFunctions/episode-helper/episode-stats-helper';

describe('Episode stats helper', () => {
    test('should get max episode from episode list', () => {
        const episode1 = new Episode(1);
        const episode2 = new Episode(2);
        const episodeS = new Episode('S3');

        const result = EpisodeStatsHelper.getMaxEpisodeFromEpisodeList([episode1, episode2, episodeS]);
        strictEqual(result, 2);
    });

    test('should get max episode from providerLocalData with detailed episodes', () => {
        const providerLocalData = new InfoProviderLocalData('1');

        const episode1 = new Episode(1);
        const episode2 = new Episode(2);
        const episodeS = new Episode('S3');
        providerLocalData.detailEpisodeInfo = [episode1, episode2, episodeS];
        const result = EpisodeStatsHelper.getMaxEpisodeNumber(providerLocalData);
        strictEqual(result, 2);
    });

    test('should get max episode from providerLocalData with max episodes number', () => {
        const providerLocalData = new InfoProviderLocalData('1');
        providerLocalData.episodes = 2;
        const result = EpisodeStatsHelper.getMaxEpisodeNumber(providerLocalData);
        strictEqual(result, 2);
    });

    test('should get max season number from detailed episodes', () => {
        const episode1 = new Episode(1, new Season(1));
        const episode2 = new Episode(2, new Season(2));
        const episodeS = new Episode('S3');
        const result = EpisodeStatsHelper.getMaxSeasonNumberFromEpisodeList([episode1, episode2, episodeS]);
        strictEqual(result, 2);
    });
});
