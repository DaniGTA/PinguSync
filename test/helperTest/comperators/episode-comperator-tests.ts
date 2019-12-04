import ListController from '../../../src/backend/controller/list-controller';

import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';

import MainListLoader from '../../../src/backend/controller/main-list-manager/main-list-loader';

import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';

import { strictEqual } from 'assert';
import Episode from '../../../src/backend/controller/objects/meta/episode/episode';
import EpisodeComperator from '../../../src/backend/helpFunctions/comperators/episode-comperator';
import TestProvider from '../../controller/objects/testClass/testProvider';
import TestHelper from '../../test-helper';
// tslint:disable: no-string-literal
describe('Episode comperator | Full test', () => {
    const lc = new ListController(true);

    before(() => {
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
        it('should compare seasons right (missing providerB season)', async () => {
            // tslint:disable-next-line: no-string-literal
            const resultA = EpisodeComperator['isEpisodeSameSeason'](aEpisode, bEpisode, 1);
            strictEqual(resultA, true);
        });
        it('should compare seasons right (missing providerA season)', async () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](aEpisode, bEpisode, 1);
            strictEqual(resultA, true);
         });
        it('should compare seasons right (missing all provider season)', async () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](aEpisode, bEpisode, 1);
            strictEqual(resultA, true);
         });
        it('should compare seasons right (missing series season)', async () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](aEpisode, bEpisode, undefined);
            strictEqual(resultA, true);
         });
        it('should compare seasons right (missing provider season and series season)', async () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](aEpisode, bEpisode, undefined);
            strictEqual(resultA, true);
         });
        it('should compare seasons false', async () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](aEpisode, bEpisode, 2);
            strictEqual(resultA, false);
         });
        it('should compare seasons right (no missing seasons)', async () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](aEpisode, aEpisode, 1);
            strictEqual(resultA, true);
         });
        it('should compare seasons false (false provider season)', async () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](aEpisode, bEpisode, 1);
            strictEqual(resultA, false);
         });
        it('should compare seasons false (false series season)', async () => {
            const resultA = EpisodeComperator['isEpisodeSameSeason'](aEpisode, bEpisode, 2);
            strictEqual(resultA, false);
        });
    });

});
