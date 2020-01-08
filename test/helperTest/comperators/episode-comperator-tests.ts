import ListController from '../../../src/backend/controller/list-controller';

import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';

import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';

import { strictEqual } from 'assert';
import Episode from '../../../src/backend/controller/objects/meta/episode/episode';
import EpisodeTitle from '../../../src/backend/controller/objects/meta/episode/episode-title';
import { EpisodeType } from '../../../src/backend/controller/objects/meta/episode/episode-type';
import EpisodeComperator from '../../../src/backend/helpFunctions/comperators/episode-comperator';
import TestProvider from '../../controller/objects/testClass/testProvider';
import TestHelper from '../../test-helper';
// tslint:disable: no-string-literal
describe('Episode comperator | Full test', () => {
    const lc = new ListController(true);

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
            }
        );
        test('should compare seasons right (missing series season)', async () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](aEpisode, bEpisode, 1, 1, undefined);
            strictEqual(resultA, true);
        });
        test(
            'should compare seasons right (missing provider season and series season)',
            async () => {
                const resultA = EpisodeComperator['isEpisodeSameSeason'](aEpisode, bEpisode, undefined, undefined, undefined);
                strictEqual(resultA, true);
            }
        );
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

});
