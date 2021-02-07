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

    describe('test fn: getMaxEpisodeNumberFromArray()', () => {
        it('should return the max episode', () => {
            const ep1 = new Episode(1);
            const ep2 = new Episode(2);

            const result = EpisodeHelper.getMaxEpisodeNumberFromEpisodeArray([ep1, ep2]);
            expect(result).toBe(2);
        });

        it('should return the max episode (0)', () => {
            const ep1 = new Episode(0);
            const result = EpisodeHelper.getMaxEpisodeNumberFromEpisodeArray([ep1]);
            expect(result).toBe(0);
        });

        it('should return undefined', () => {
            const ep1 = new Episode('special');
            const ep2 = new Episode('very special');

            const result = EpisodeHelper.getMaxEpisodeNumberFromEpisodeArray([ep1, ep2]);
            expect(result).toBe(undefined);
        });
    });

    describe('test fn: groupBySeriesIds()', () => {
        it('should find 2 differen series', () => {
            const ep1 = new Episode(1);
            ep1.providerId = '1';
            const ep2 = new Episode(2);
            ep2.providerId = '1';
            const ep1v2 = new Episode(1);
            ep1v2.providerId = '2';

            const result = EpisodeHelper.groupBySeriesIds([ep1, ep2, ep1v2]);
            expect(result.length).toBe(2);
            expect(result[0].length).toBe(2);
            expect(result[1].length).toBe(1);
        });
    });

    describe('test fn: isSameEpisodeID()', () => {
        test('should be true', () => {
            const episode1 = new Episode(1, new Season(1));
            const result = EpisodeHelper.isSameEpisodeID(episode1, episode1);
            expect(result).toBeTruthy();
        });

        test('should be false', () => {
            const episode1 = new Episode(1, new Season(1));
            const episode2 = new Episode(2, new Season(1));
            const result = EpisodeHelper.isSameEpisodeID(episode1, episode2);
            expect(result).toBeFalsy();
        });
    });

    describe('test fn: getMinEpisodeNumberFromEpisodeArray()', () => {
        test('should get min episode number from detailed episodes', () => {
            const episode1 = new Episode(1, new Season(1));
            const episode2 = new Episode(2, new Season(2));
            const episodeS = new Episode('S3');
            const result = EpisodeHelper.getMinEpisodeNumberFromEpisodeArray([episode1, episode2, episodeS]);
            expect(result).toBe(1);
        });

        test('should get min episode number from detailed episodes with no first episode', () => {
            const episode1 = new Episode(2, new Season(1));
            const episode2 = new Episode(3, new Season(2));
            const episodeS = new Episode('S4');
            const result = EpisodeHelper.getMinEpisodeNumberFromEpisodeArray([episode1, episode2, episodeS]);
            expect(result).toBe(2);
        });

        test('should get min episode number from detailed episodes with special episode', () => {
            const episode1 = new Episode(2, new Season(1));
            const episode2 = new Episode(3, new Season(2));
            const episodeS = new Episode('S1');
            const result = EpisodeHelper.getMinEpisodeNumberFromEpisodeArray([episode1, episode2, episodeS]);
            expect(result).toBe(2);
        });
    });
});
