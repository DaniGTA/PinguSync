import { strictEqual } from 'assert';
import Episode from '../../src/backend/controller/objects/meta/episode/episode';
import EpisodeBindingPool from '../../src/backend/controller/objects/meta/episode/episode-binding-pool';
import EpisodeMapping from '../../src/backend/controller/objects/meta/episode/episode-mapping';
import { ListProviderLocalData } from '../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import EpisodeBindingPoolHelper from '../../src/backend/helpFunctions/episode-binding-pool-helper';
import TestHelper from '../test-helper';

describe('Episode binding pool helper tests | Testrun', () => {
    beforeEach(() => {
        TestHelper.mustHaveBefore();
    });
    test('should get all binded episode from an episode', async () => {
        const episode = new Episode(1);
        const episodeMapping1 = new EpisodeMapping(episode, new ListProviderLocalData(1, 'a'));
        const episodeMapping2 = new EpisodeMapping(new Episode(1), new ListProviderLocalData(1, 'b'));
        const episodeBindingPool = new EpisodeBindingPool(episodeMapping1, episodeMapping2);

        const episode2 = new Episode(2);
        const episode2Mapping1 = new EpisodeMapping(episode2, new ListProviderLocalData(1, 'a'));
        const episode2Mapping2 = new EpisodeMapping(new Episode(2), new ListProviderLocalData(1, 'b'));
        const episode2BindingPool = new EpisodeBindingPool(episode2Mapping1, episode2Mapping2);

        const result = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode([episodeBindingPool, episode2BindingPool], episode);
        strictEqual(result.length, 1);
    });
});
