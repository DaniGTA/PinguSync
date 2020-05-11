import Episode from '../../src/backend/controller/objects/meta/episode/episode';
import EpisodeTitle from '../../src/backend/controller/objects/meta/episode/episode-title';
import Season from '../../src/backend/controller/objects/meta/season';
import EpisodeHelper from '../../src/backend/helpFunctions/episode-helper/episode-helper';
import EpisodeRelationAnalyser from '../../src/backend/helpFunctions/episode-helper/episode-relation-analyser';


describe('Episode Helper Test', () => {
    test('should detect episode title', () => {
        const detailedEpisode1 = new Episode(1);
        const detailedEpisode2 = new Episode(2);
        detailedEpisode2.title.push(new EpisodeTitle('test', 'test'));
        const list = [detailedEpisode1, detailedEpisode2];
        const result = EpisodeHelper.hasEpisodeNames(list);
        expect(result).toBeTruthy();
    });

    test('shouldnt detect episode title', () => {
        const detailedEpisode1 = new Episode(1);
        const detailedEpisode2 = new Episode(2);
        const list = [detailedEpisode1, detailedEpisode2];
        const result = EpisodeHelper.hasEpisodeNames(list);
        expect(result).toBeFalsy();
    });

    test('should find one missing episode', () => {
        const detailedEpisodeS1e1 = new Episode(1, new Season(1), [new EpisodeTitle('test 1', 'test')]);
        const detailedEpisodeS1e2 = new Episode(2, new Season(1), [new EpisodeTitle('test 2', 'test')]);
        const detailedEpisodeS2e1 = new Episode(1, new Season(2), [new EpisodeTitle('test 3', 'test')]);
        const detailedEpisodeS2e2 = new Episode(2, new Season(2), [new EpisodeTitle('test 4', 'test')]);
        const list = [detailedEpisodeS1e1, detailedEpisodeS1e2, detailedEpisodeS2e1, detailedEpisodeS2e2];

        const part2DetailedEpisodeS2e1 = new Episode(1, undefined, [new EpisodeTitle('test 3', 'test')]);

        const list2 = [part2DetailedEpisodeS2e1];

        const result = new EpisodeRelationAnalyser(list, list2);
        expect(result.maxEpisodes).toEqual(2);
        expect(result.missingEpisodes).toEqual(1);
        expect(result.seasonComplete).toBeTruthy();
        expect(result.numberOfRegularEpisodesFound).toEqual(1);
        expect(result?.seasonNumbers?.[0]).toEqual(2);
    });

    test('should get difference of episode', () => {
        const episodeA = new Episode(1);
        const episodeB = new Episode(2);

        expect(EpisodeHelper.getEpisodeDifference(episodeA, episodeB)).toEqual(-1);
        expect(EpisodeHelper.getEpisodeDifference(episodeB, episodeA)).toEqual(1);
    });
});
