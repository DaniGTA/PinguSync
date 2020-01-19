import { strictEqual } from 'assert';
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import Episode from '../../../src/backend/controller/objects/meta/episode/episode';
import EpisodeTitle from '../../../src/backend/controller/objects/meta/episode/episode-title';
import { EpisodeType } from '../../../src/backend/controller/objects/meta/episode/episode-type';
import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';
import EpisodeComperator from '../../../src/backend/helpFunctions/comperators/episode-comperator';
import TestProvider from '../../controller/objects/testClass/testProvider';
import TestHelper from '../../test-helper';
import { AbsoluteResult } from '../../../src/backend/helpFunctions/comperators/comperator-results.ts/comperator-result';
// tslint:disable: no-string-literal
describe('Episode comperator | Full test', () => {
    beforeAll(() => {
        TestHelper.mustHaveBefore();
    });
    beforeEach(() => {
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = [new TestProvider('Test'), new TestProvider('')];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = [];
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [];
    });
    describe('season tests', () => {
        const aEpisode = new Episode(0, 1);
        const bEpisode = new Episode(0);
        test('should compare seasons right (missing providerB season)', async () => {
            // tslint:disable-next-line: no-string-literal
            const resultA = EpisodeComperator['isEpisodeSameSeason'](aEpisode, bEpisode, 1, undefined, 1);
            strictEqual(resultA, true);
        });
        test('should compare seasons right (missing providerA season)', async () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](aEpisode, bEpisode, undefined, 1, 1);
            strictEqual(resultA, true);
        });
        test(
            'should compare seasons right (missing all provider season)',
            async () => {
                const resultA = EpisodeComperator['isEpisodeSameSeason'](aEpisode, bEpisode, undefined, undefined, 1);
                strictEqual(resultA, true);
            });
        test('should compare seasons right (missing series season)', async () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](aEpisode, bEpisode, 1, 1, undefined);
            strictEqual(resultA, true);
        });
        test(
            'should compare seasons right (missing provider season and series season)',
            async () => {
                const resultA = EpisodeComperator['isEpisodeSameSeason'](aEpisode, bEpisode, undefined, undefined, undefined);
                strictEqual(resultA, true);
            });
        test('should compare seasons false', async () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](aEpisode, bEpisode, undefined, undefined, 2);
            strictEqual(resultA, false);
        });
        test('should compare seasons right (no missing seasons)', async () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](aEpisode, aEpisode, 1, 1, 1);
            strictEqual(resultA, true);
        });
        test('should compare seasons false (false provider season)', async () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](aEpisode, bEpisode, 1, 2, 1);
            strictEqual(resultA, false);
        });
        test('should compare seasons false (false series season)', async () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](aEpisode, bEpisode, undefined, undefined, 2);
            strictEqual(resultA, false);
        });
    });

    test('should compare the episode as not the same', async () => {
        const episodeA = new Episode(2, undefined);
        episodeA.provider = 'AniList';
        episodeA.type = EpisodeType.REGULAR_EPISODE;

        const episodeB = new Episode(1, 1);
        episodeB.title.push(new EpisodeTitle('test'));
        episodeB.type = EpisodeType.UNKOWN;
        episodeB.providerEpisodeId = 123;

        const result = await EpisodeComperator.compareDetailedEpisode(episodeA, episodeB, undefined, undefined, 2, 0);
        strictEqual(result.matchAble, 1);
        strictEqual(result.matches, 0);
    });

    test('should compare the episode as the same', async () => {
        const episodeA = new Episode(2, undefined);
        episodeA.type = EpisodeType.OTHER;
        episodeA.summery = 'ABC';
        episodeA.title.push(new EpisodeTitle('X', 'X'));
        episodeA.title.push(new EpisodeTitle('ABC', 'ABC'));
        episodeA.title.push(new EpisodeTitle('Y', 'Y'));
        episodeA.title.push(new EpisodeTitle('ABC', 'ABC2'));


        const episodeB = new Episode(2, 1);
        episodeB.title.push(new EpisodeTitle('ABC'));
        episodeB.type = EpisodeType.UNKOWN;
        episodeB.providerEpisodeId = 123;

        const result = await EpisodeComperator.compareEpisodeTitle(episodeA, episodeB);
        strictEqual(result.matchAble, 4);
        strictEqual(result.matches, 2);
        strictEqual(result.isAbsolute, AbsoluteResult.ABSOLUTE_TRUE);
        });
    
    describe('compares simple episode number vs detailed episode', () => {
        test('same ep 0 s0 (should return true)', async () => {
            const detailedEpisode = new Episode(0, 0);
            const result = await EpisodeComperator.isEpisodeSameAsDetailedEpisode(0, detailedEpisode, 0);

            strictEqual(result, true);
        });

        test('same ep 1 s1 (should return true)', async () => {
            const detailedEpisode = new Episode(1, 1);
            const result = await EpisodeComperator.isEpisodeSameAsDetailedEpisode(1, detailedEpisode, 1);

            strictEqual(result, true);
        });

        test('different ep 1 s1 and ep 2 s1 (should return false)', async () => {
            const detailedEpisode = new Episode(1, 1);
            const result = await EpisodeComperator.isEpisodeSameAsDetailedEpisode(2, detailedEpisode, 1);

            strictEqual(result, false);
        });
    });
});
