import Series from '../../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import Episode from '../../../src/backend/controller/objects/meta/episode/episode';
import WatchHistory from '../../../src/backend/controller/objects/meta/episode/episode-watch-history';
import EpisodeMappingHelper from '../../../src/backend/helpFunctions/episode-mapping-helper/episode-mapping-helper';
import SyncEpisodes from '../../../src/backend/controller/sync-controller/sync-episodes';
import TestProvider from '../objects/testClass/testProvider';
import ProviderList from '../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import ListProvider from '../../../src/backend/api/provider/list-provider';

describe('sync episode test', () => {
    beforeAll(() => {
        ProviderList['loadedListProvider'] = [new TestProvider('A'), new TestProvider('B')];
    });
    describe('test series with provider', () => {
        const series: Series = new Series();
        let providerB: null | ListProvider = null;
        let providerA: null | ListProvider = null;
        const ep1 = new Episode(1);
        beforeAll(async () => {
            const loadedList = ProviderList['loadedListProvider'] ?? [];
            providerB = loadedList[1];
            providerA = loadedList[0];
            const provider1 = new ListProviderLocalData(1, 'A');

            ep1.watchHistory.push(new WatchHistory());
            provider1.addDetailedEpisodeInfos(ep1);
            const ep2 = new Episode(2);
            ep2.watchHistory.push(new WatchHistory());

            provider1.addDetailedEpisodeInfos(ep2);

            const provider2 = new ListProviderLocalData(1, 'B');
            provider2.addDetailedEpisodeInfos(new Episode(1));
            provider2.addDetailedEpisodeInfos(new Episode(2));

            series.addProviderDatas(provider1, provider2);

            series.episodeBindingPools.push(...await EpisodeMappingHelper.getEpisodeMappings(series));
        });

        it('provider A should be sync', () => {
            const resultA = new SyncEpisodes(series).getSyncStatus(providerA as ListProvider);
            expect(resultA.isSync).toBeTruthy();
        });

        it('provider B should not be sync', () => {
            const resultB = new SyncEpisodes(series).getSyncStatus(providerB as ListProvider);
            expect(resultB.isSync).toBeFalsy();
        });

        it('should check if a single episode is sync', () => {
            const result = new SyncEpisodes(series).isSyncByEpisode(ep1);
            expect(result).toBeTruthy();
        });

    });

});