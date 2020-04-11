import { strictEqual } from 'assert';

import AniListProvider from '../../../src/backend/api/information-providers/anilist/anilist-provider';
import TraktProvider from '../../../src/backend/api/information-providers/trakt/trakt-provider';
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import Episode from '../../../src/backend/controller/objects/meta/episode/episode';
import EpisodeBindingPool from '../../../src/backend/controller/objects/meta/episode/episode-binding-pool';
import EpisodeMapping from '../../../src/backend/controller/objects/meta/episode/episode-mapping';
import EpisodeTitle from '../../../src/backend/controller/objects/meta/episode/episode-title';
import Season from '../../../src/backend/controller/objects/meta/season';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import ProviderLoader from '../../../src/backend/controller/provider-controller/provider-manager/provider-loader';
import EpisodeRatedEqualityHelper from '../../../src/backend/helpFunctions/episode-mapping-helper/episode-rated-equality-helper';
import ProviderLocalDataWithSeasonInfo from '../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import TestProvider from '../../controller/objects/testClass/testProvider';

describe('Episode rated equality helper tests | Difference calc only', () => {
    beforeEach(() => {
        // tslint:disable: no-string-literal
        (ProviderLoader.prototype as any).listOfListProviders = [TestProvider, AniListProvider];
        ProviderList['loadedInfoProvider'] = [];
        MainListManager['mainList'] = [];
    });

    test('should filter unnecessery episodes out', async () => {
        // Provider: a (ep: 2)
        const aProvider = new ListProviderLocalData('-1', AniListProvider);
        const aEp1 = new Episode(1);
        const aEp2 = new Episode(2);
        aProvider.addDetailedEpisodeInfos(aEp1, aEp2);
        const aProviderWithSeason = new ProviderLocalDataWithSeasonInfo(aProvider);
        // Provider: a end

        // Provider: b (ep: 4, seasons: 2)
        const bProvider = new ListProviderLocalData('-1', TraktProvider);
        const bEp1s1 = new Episode(1, new Season(1));
        const bEp2s1 = new Episode(2, new Season(1));
        const bEp1s2 = new Episode(1, new Season(2));
        const bEp2s2 = new Episode(2, new Season(2));
        bProvider.addDetailedEpisodeInfos(bEp1s1, bEp2s1, bEp1s2, bEp2s2);
        const bProviderWithSeason = new ProviderLocalDataWithSeasonInfo(bProvider, new Season(2));
        // Provider: b end

        const equalityInstance = new EpisodeRatedEqualityHelper([], []);
        const resultA = equalityInstance['getAllRelevantEpisodes'](aProviderWithSeason, bProviderWithSeason);
        const resultB = equalityInstance['getAllRelevantEpisodes'](bProviderWithSeason, aProviderWithSeason);

        strictEqual(resultA.result.length, 2);
        strictEqual(resultB.result.length, 2);
        strictEqual(resultA.diff, 0);
        strictEqual(resultB.diff, 0);
    });

    test('should not filter out', async () => {
        // Provider: a (ep: 2)
        const aProvider = new ListProviderLocalData('-1', AniListProvider);
        const aEp1 = new Episode(1);
        aEp1.title.push(new EpisodeTitle('x'));
        const aEp2 = new Episode(2);
        aProvider.addDetailedEpisodeInfos(aEp1, aEp2);
        const aProviderWithSeason = new ProviderLocalDataWithSeasonInfo(aProvider, new Season());
        // Provider: a end

        // Provider: b (ep: 4, seasons: 2)
        const bProvider = new ListProviderLocalData('-1', TraktProvider);
        const bEp1s1 = new Episode(1, new Season(1));
        const bEp2s1 = new Episode(2, new Season(1));
        const bEp3s1 = new Episode(3, new Season(1));
        bEp3s1.title.push(new EpisodeTitle('x'));
        const bEp4s1 = new Episode(4, new Season(1));
        bProvider.addDetailedEpisodeInfos(bEp1s1, bEp2s1, bEp3s1, bEp4s1);
        const bProviderWithSeason = new ProviderLocalDataWithSeasonInfo(bProvider, new Season(1));
        // Provider: b end

        const equalityInstance = new EpisodeRatedEqualityHelper([], []);
        const resultA = equalityInstance['getAllRelevantEpisodes'](aProviderWithSeason, bProviderWithSeason);
        const resultB = equalityInstance['getAllRelevantEpisodes'](bProviderWithSeason, aProviderWithSeason);

        strictEqual(resultA.result.length, 2);
        strictEqual(resultB.result.length, 4);
        strictEqual(resultA.diff, 0);
        strictEqual(resultB.diff, 0);
    });

    test('should create diff', async () => {
        // Provider: a (ep: 2)
        const aProvider = new ListProviderLocalData('-1', AniListProvider);
        const aEp1 = new Episode(1);
        aEp1.title.push(new EpisodeTitle('x'));
        const aEp2 = new Episode(2);
        aProvider.addDetailedEpisodeInfos(aEp1, aEp2);
        const aProviderWithSeason = new ProviderLocalDataWithSeasonInfo(aProvider, new Season());
        // Provider: a end

        // Provider: b (ep: 4, seasons: 2)
        const bProvider = new ListProviderLocalData('-1', TraktProvider);
        const bEp1s1 = new Episode(1, new Season(1));
        const bEp2s1 = new Episode(2, new Season(1));
        const bEp3s1 = new Episode(3, new Season(1));
        bEp3s1.title.push(new EpisodeTitle('x'));
        const bEp4s1 = new Episode(4, new Season(1));
        bProvider.addDetailedEpisodeInfos(bEp1s1, bEp2s1, bEp3s1, bEp4s1);
        const bProviderWithSeason = new ProviderLocalDataWithSeasonInfo(bProvider, new Season(1));
        // Provider: b end

        const mappingB1 = new EpisodeMapping(bEp1s1, bProvider);
        const mappingB2 = new EpisodeMapping(bEp2s1, bProvider);

        const mappingA1 = new EpisodeMapping(new Episode(1), new ListProviderLocalData('-2', AniListProvider));
        const mappingA2 = new EpisodeMapping(new Episode(2), new ListProviderLocalData('-2', AniListProvider));

        const pool1 = new EpisodeBindingPool(mappingB1, mappingA1);
        const pool2 = new EpisodeBindingPool(mappingB2, mappingA2);

        const equalityInstance = new EpisodeRatedEqualityHelper([], [pool1, pool2]);
        const resultA = equalityInstance['getAllRelevantEpisodes'](aProviderWithSeason, bProviderWithSeason);
        const resultB = equalityInstance['getAllRelevantEpisodes'](bProviderWithSeason, aProviderWithSeason);

        strictEqual(resultA.result.length, 2);
        strictEqual(resultB.result.length, 2);
        strictEqual(resultA.diff, -2);
        strictEqual(resultB.diff, 2);
    });
});
