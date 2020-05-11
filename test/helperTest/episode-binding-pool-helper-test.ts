import Episode from '../../src/backend/controller/objects/meta/episode/episode';
import EpisodeBindingPool from '../../src/backend/controller/objects/meta/episode/episode-binding-pool';
import EpisodeMapping from '../../src/backend/controller/objects/meta/episode/episode-mapping';
import { ListProviderLocalData } from '../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import EpisodeBindingPoolHelper from '../../src/backend/helpFunctions/episode-binding-pool-helper';

import Season from '../../src/backend/controller/objects/meta/season';
import Series from '../../src/backend/controller/objects/series';

describe('Episode binding pool helper tests | Testrun', () => {
    test('should get all binded episode from an episode', () => {
        const episode = new Episode(1);
        const episodeMapping1 = new EpisodeMapping(episode, new ListProviderLocalData(1, 'a'));
        const episodeMapping2 = new EpisodeMapping(new Episode(1), new ListProviderLocalData(1, 'b'));
        const episodeBindingPool = new EpisodeBindingPool(episodeMapping1, episodeMapping2);

        const episode2 = new Episode(2);
        const episode2Mapping1 = new EpisodeMapping(episode2, new ListProviderLocalData(1, 'a'));
        const episode2Mapping2 = new EpisodeMapping(new Episode(2), new ListProviderLocalData(1, 'b'));
        const episode2BindingPool = new EpisodeBindingPool(episode2Mapping1, episode2Mapping2);

        const result = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode([episodeBindingPool, episode2BindingPool], episode);
        expect(result.length).toEqual(1);
    });

    test('should not get season 2 with special season', () => {
        const testEpsiode1 = new Episode(2, new Season(2));
        testEpsiode1.providerEpisodeId = 2454207;
        const episodeMapping1 = new EpisodeMapping(testEpsiode1, new ListProviderLocalData(1, 'b'));

        const episodeMapping2 = new EpisodeMapping(new Episode(2), new ListProviderLocalData(1, 'a'));
        const episodeBindingPool = new EpisodeBindingPool(episodeMapping1, episodeMapping2);


        const series = new Series();
        series.addEpisodeBindingPools(episodeBindingPool);

        const specialEpisode = new Episode(2, new Season(0, undefined, 0));
        specialEpisode.provider = 'b';
        specialEpisode.providerEpisodeId = 2293086;

        const specialEpisodeMapping = new EpisodeMapping(specialEpisode, new ListProviderLocalData(1, 'b'));
        series.addEpisodeMapping(specialEpisodeMapping);


        const result = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode([episodeBindingPool], specialEpisode);

        expect(result.length).toEqual(0);
    });

    describe('testing function: isEpisodeAlreadyBindedToAProvider', () => {
        const episode1 = new Episode(2);
        episode1.provider = 'a';
        const episode2 = new Episode(2);
        episode2.provider = 'b';
        const episodeMapping1 = new EpisodeMapping(episode1, new ListProviderLocalData(1, 'a'));
        const episodeMapping2 = new EpisodeMapping(episode2, new ListProviderLocalData(1, 'b'));

        const episodeBindingPool = new EpisodeBindingPool(episodeMapping1, episodeMapping2);
        test('should find already binded episode', () => {
            const result = EpisodeBindingPoolHelper.isEpisodeAlreadyBindedToAProvider([episodeBindingPool], episode1, 'b');
            expect(result).toBeTruthy();
        });

        test('should not find already binded episode', () => {
            const result2 = EpisodeBindingPoolHelper.isEpisodeAlreadyBindedToAProvider([episodeBindingPool], episode1, 'c');
            expect(result2).toBeFalsy();
        });
    });
});
