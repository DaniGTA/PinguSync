import { strictEqual } from 'assert';
import Episode from '../../src/backend/controller/objects/meta/episode/episode';
import EpisodeTitle from '../../src/backend/controller/objects/meta/episode/episode-title';
import EpisodeHelper from '../../src/backend/helpFunctions/episode-helper/episode-helper';
import TestHelper from '../test-helper';

describe('Episode Helper Test', () => {
    beforeEach(() => {
        TestHelper.mustHaveBefore();
    });

    test('should detect episode title', () => {
        const detailedEpisode1 = new Episode(1);
        const detailedEpisode2 = new Episode(2);
        detailedEpisode2.title.push(new EpisodeTitle('test', 'test'));
        const list = [detailedEpisode1, detailedEpisode2];
        const result = EpisodeHelper.hasEpisodeNames(list);
        strictEqual(result, true);
    });

    test('shouldnt detect episode title', () => {
        const detailedEpisode1 = new Episode(1);
        const detailedEpisode2 = new Episode(2);
        const list = [detailedEpisode1, detailedEpisode2];
        const result = EpisodeHelper.hasEpisodeNames(list);
        strictEqual(result, false);
    });

    test('should get episode count from season value', () => {
        const detailedEpisodeS1e1 = new Episode(1, 1);
        const detailedEpisodeS1e2 = new Episode(2, 1);
        const detailedEpisodeS2e1 = new Episode(1, 2);
        const detailedEpisodeS2e2 = new Episode(2, 2);

        const list = [detailedEpisodeS1e1, detailedEpisodeS1e2, detailedEpisodeS2e1, detailedEpisodeS2e2];

        strictEqual(EpisodeHelper.getEpisodeCountOfSeason(list, 1), 2);
        strictEqual(EpisodeHelper.getEpisodeCountOfSeason(list, 2), 2);
        strictEqual(EpisodeHelper.getEpisodeCountOfSeason(list, 3), 0);
    });

    test('should find one missing episode', () => {
        const detailedEpisodeS1e1 = new Episode(1, 1, [new EpisodeTitle('test 1', 'test')]);
        const detailedEpisodeS1e2 = new Episode(2, 1, [new EpisodeTitle('test 2', 'test')]);
        const detailedEpisodeS2e1 = new Episode(1, 2, [new EpisodeTitle('test 3', 'test')]);
        const detailedEpisodeS2e2 = new Episode(2, 2, [new EpisodeTitle('test 4', 'test')]);
        const list = [detailedEpisodeS1e1, detailedEpisodeS1e2, detailedEpisodeS2e1, detailedEpisodeS2e2];

        const part2DetailedEpisodeS2e1 = new Episode(1, undefined, [new EpisodeTitle('test 3', 'test')]);

        const list2 = [part2DetailedEpisodeS2e1];

        const result = EpisodeHelper.calculateRelationBetweenEpisodes(list, list2);
        strictEqual(result.episodes, 2);
        strictEqual(result.missingEpisodes, 1);
        strictEqual(result.seasonComplete, false);
        strictEqual(result.episodesFound, 1);
        strictEqual(result.seasonNumber, 2);
    });
});
