
import { fail, notStrictEqual, strictEqual } from 'assert';
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import Episode from '../../../src/backend/controller/objects/meta/episode/episode';
import { EpisodeType } from '../../../src/backend/controller/objects/meta/episode/episode-type';
import Season from '../../../src/backend/controller/objects/meta/season';
import Series from '../../../src/backend/controller/objects/series';
import ProviderDataListManager from '../../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager';
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import ComperatorResult from '../../../src/backend/helpFunctions/comperators/comperator-results.ts/comperator-result';
import EpisodeBindingPoolHelper from '../../../src/backend/helpFunctions/episode-binding-pool-helper';
import EpisodeHelper from '../../../src/backend/helpFunctions/episode-helper/episode-helper';
import EpisodeMappingHelper from '../../../src/backend/helpFunctions/episode-mapping-helper/episode-mapping-helper';
import EpisodeRatedEqualityContainerHelper from '../../../src/backend/helpFunctions/episode-mapping-helper/episode-rated-equality-container-helper';
import EpisodeRatedEqualityContainer from '../../../src/backend/helpFunctions/episode-mapping-helper/objects/episode-rated-equality-container';
import listHelper from '../../../src/backend/helpFunctions/list-helper';
import ProviderLocalDataWithSeasonInfo from '../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import sortHelper from '../../../src/backend/helpFunctions/sort-helper';
import TestProvider from '../../controller/objects/testClass/testProvider';

// tslint:disable: no-string-literal
describe('Episode mapping | Mapping Only', () => {
    beforeEach(() => {
        ProviderList['loadedListProvider'] = [new TestProvider('Test'), new TestProvider('')];
        ProviderList['loadedInfoProvider'] = [];
        MainListManager['mainList'] = [];
        ProviderDataListManager['providerDataList'] = [];
    });
    test('should map same episodes length from 2 providers', async () => {
        const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('1', 'testA');
        aProvider.addDetailedEpisodeInfos(new Episode(1));
        aProvider.addDetailedEpisodeInfos(new Episode(2));
        aProvider.addDetailedEpisodeInfos(new Episode(3));

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(aProvider, new Season([1])));

        // B Site

        const bProvider = new ListProviderLocalData(1, 'testB');
        bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1])));

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(bProvider, new Season([1])));

        // Testing

        const result = await EpisodeMappingHelper.getEpisodeMappings(aSeries);

        // Extract results.

        const aEpisodeInfo1 = aProvider.detailEpisodeInfo[0];
        const aEpisodeInfo2 = aProvider.detailEpisodeInfo[1];
        const aEpisodeInfo3 = aProvider.detailEpisodeInfo[2];

        const bEpisodeInfo1 = bProvider.detailEpisodeInfo[0];
        const bEpisodeInfo2 = bProvider.detailEpisodeInfo[1];
        const bEpisodeInfo3 = bProvider.detailEpisodeInfo[2];

        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3)) {
            fail('not all episodes found in the result');
        } else {
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1).length, 1, 'Episode A1 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2).length, 1, 'Episode A2 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3).length, 1, 'Episode A3 mapping length should be 1');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1)[0].id, bEpisodeInfo1.id, `Episode A1 (${aEpisodeInfo1.id}) should have id mapped to Episode B1 (${bEpisodeInfo1.id})`);
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2)[0].id, bEpisodeInfo2.id, `Episode A2 (${aEpisodeInfo2.id}) should have id mapped to Episode B2 (${bEpisodeInfo2.id})`);
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3)[0].id, bEpisodeInfo3.id, `Episode A3 (${aEpisodeInfo3.id}) should have id mapped to Episode B3 (${bEpisodeInfo3.id})`);

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1).length, 1, 'Episode B1 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2).length, 1, 'Episode B2 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3).length, 1, 'Episode B3 mapping length should be 1');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1)[0].id, aEpisodeInfo1.id, 'Episode B1 should have id mapped to Episode A1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2)[0].id, aEpisodeInfo2.id, 'Episode B2 should have id mapped to Episode A2');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3)[0].id, aEpisodeInfo3.id, 'Episode B3 should have id mapped to Episode A3');
        }
    });

    test('should map same episodes length from 3 providers', async () => {
        const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('1', 'testA');
        aProvider.addDetailedEpisodeInfos(new Episode(1));
        aProvider.addDetailedEpisodeInfos(new Episode(2));
        aProvider.addDetailedEpisodeInfos(new Episode(3));

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(aProvider, new Season([1])));

        // B Site

        const bProvider = new ListProviderLocalData('1', 'testB');
        bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1])));

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(bProvider, new Season([1])));


        // C Site

        const cProvider = new ListProviderLocalData('1', 'testC');
        cProvider.addDetailedEpisodeInfos(new Episode(1, new Season([1])));
        cProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1])));
        cProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1])));

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(cProvider, new Season([1])));

        // Testing

        const result = await EpisodeMappingHelper.getEpisodeMappings(aSeries);

        // Extract results.

        const aEpisodeInfo1 = aProvider.detailEpisodeInfo[0];
        const aEpisodeInfo2 = aProvider.detailEpisodeInfo[1];
        const aEpisodeInfo3 = aProvider.detailEpisodeInfo[2];

        const bEpisodeInfo1 = bProvider.detailEpisodeInfo[0];
        const bEpisodeInfo2 = bProvider.detailEpisodeInfo[1];
        const bEpisodeInfo3 = bProvider.detailEpisodeInfo[2];

        const cEpisodeInfo1 = cProvider.detailEpisodeInfo[0];
        const cEpisodeInfo2 = cProvider.detailEpisodeInfo[1];
        const cEpisodeInfo3 = cProvider.detailEpisodeInfo[2];

        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3 && cEpisodeInfo1 && cEpisodeInfo2 && cEpisodeInfo3)) {
            fail('not all episodes found in the result');
        } else {
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1).length, 2, 'Episode A1 mapping length should be 2');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2).length, 2, 'Episode A2 mapping length should be 2');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3).length, 2, 'Episode A3 mapping length should be 2');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1).length, 2, 'Episode B1 mapping length should be 2');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2).length, 2, 'Episode B2 mapping length should be 2');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3).length, 2, 'Episode B3 mapping length should be 2');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, cEpisodeInfo1).length, 2, 'Episode C1 mapping length should be 2');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, cEpisodeInfo2).length, 2, 'Episode C2 mapping length should be 2');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, cEpisodeInfo3).length, 2, 'Episode C3 mapping length should be 2');
        }
    });

    test(
        'should map same episodes length from different providers without detailedEpisodes',
        async () => {
            const aSeries = new Series();

            // A Site

            const aProvider = new InfoProviderLocalData('1', 'testA');
            aProvider.episodes = 250;

            await aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(aProvider, new Season([1])));

            // B Site

            const bProvider = new ListProviderLocalData('1', 'testB');
            bProvider.episodes = 250;

            await aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(bProvider, new Season([1])));

            // C Site

            const cProvider = new ListProviderLocalData('1', 'testC');
            cProvider.episodes = 250;

            await aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(cProvider, new Season([1])));

            // Testing

            const result = await EpisodeMappingHelper.getEpisodeMappings(aSeries);

            // Result checking
            for (const episode of aSeries.getAllProviderLocalDatas().flatMap(x => x.getAllDetailedEpisodes())) {
                const mappedTo = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, episode);
                strictEqual(mappedTo.length, 2, episode.episodeNumber + '');
                strictEqual(mappedTo[0].episodeNumber, episode.episodeNumber);
                notStrictEqual(mappedTo[0].provider, episode.provider);
            }
        },
    );

    test('should map episodes length with detailedEpisodes', async () => {
        const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('1', 'testA');
        aProvider.episodes = 3;

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(aProvider, new Season([1])));

        // B Site

        const bProvider = new ListProviderLocalData('1', 'testB');
        bProvider.addDetailedEpisodeInfos(new Episode(1));
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1])));

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(bProvider, new Season([1])));

        // Testing

        const result = await EpisodeMappingHelper.getEpisodeMappings(aSeries);
        // Result checking
        for (const episode of aSeries.getAllProviderLocalDatas().flatMap(x => x.getAllDetailedEpisodes())) {
            const mappedTo = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, episode);

            strictEqual(mappedTo.length, 1);
            strictEqual(mappedTo[0].episodeNumber, episode.episodeNumber);
            notStrictEqual(mappedTo[0].provider, episode.provider);
        }
    });

    test('should map find unmapped episodes in the sequel', async () => {
        const aSeries = new Series();
        const sequelOfaSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('1', 'testA');
        aProvider.episodes = 3;
        aProvider.sequelIds.push(2);

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(aProvider, new Season([1])));

        // B Site

        const bProvider = new ListProviderLocalData('1', 'testB');
        bProvider.addDetailedEpisodeInfos(new Episode(1));
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(4, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(5, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(6, new Season([1])));

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(bProvider, new Season([1])));


        // Sequel

        const cProvider = new InfoProviderLocalData(2, 'testA');
        cProvider.episodes = 3;

        await sequelOfaSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(cProvider, new Season([2])));
        await sequelOfaSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(bProvider, new Season([1])));

        // Testing
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [aSeries, sequelOfaSeries];

        await MainListManager.finishListFilling();

        // Result checking
        const allEpisodeBindingsPool = (await MainListManager.getMainList()).flatMap((x) => x.episodeBindingPools);

        for (const episode of aSeries.getAllProviderLocalDatas().flatMap(x => x.getAllDetailedEpisodes())) {
            const mappedTo = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(allEpisodeBindingsPool, episode);
            strictEqual(mappedTo.length, 1, episode.episodeNumber + '');
            notStrictEqual(mappedTo[0].provider, episode.provider);
        }
    });

    test(
        'should map find unmapped episodes in the sequel of the sequel',
        async () => {
            const aSeries = new Series();
            const sequelOfaSeries = new Series();
            const sequelOfSequelOfaSeries = new Series();

            // A Site

            const aProvider = new InfoProviderLocalData('1', 'testA');
            aProvider.episodes = 3;
            aProvider.sequelIds.push(2);

            await aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(aProvider, new Season([1])));

            // B Site

            const bProvider = new ListProviderLocalData('1', 'testB');
            bProvider.addDetailedEpisodeInfos(new Episode(1));
            bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1])));
            bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1])));
            bProvider.addDetailedEpisodeInfos(new Episode(4, new Season([1])));
            bProvider.addDetailedEpisodeInfos(new Episode(5, new Season([1])));
            bProvider.addDetailedEpisodeInfos(new Episode(6, new Season([1])));
            bProvider.addDetailedEpisodeInfos(new Episode(7, new Season([1])));
            bProvider.addDetailedEpisodeInfos(new Episode(8, new Season([1])));
            bProvider.addDetailedEpisodeInfos(new Episode(9, new Season([1])));

            await aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(bProvider, new Season([1])));

            // Sequel

            const cProvider = new InfoProviderLocalData(2, 'testA');
            cProvider.episodes = 3;
            cProvider.sequelIds.push(3);
            await sequelOfaSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(cProvider, new Season([2])));
            await sequelOfaSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(bProvider, new Season([2])));


            // Sequel 2

            const dProvider = new InfoProviderLocalData(3, 'testA');
            dProvider.episodes = 3;

            await sequelOfSequelOfaSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(dProvider, new Season([3])));
            await sequelOfSequelOfaSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(bProvider, new Season([3])));


            // Testing
            // tslint:disable-next-line: no-string-literal
            MainListManager['mainList'] = [aSeries, sequelOfaSeries, sequelOfSequelOfaSeries];

            await MainListManager.finishListFilling();

            const allEpisodeBindingsPool = (await MainListManager.getMainList()).flatMap((x) => x.episodeBindingPools);

            // Result checking
            for (const episode of aSeries.getAllProviderLocalDatas().flatMap(x => x.getAllDetailedEpisodes())) {
                const mappedTo = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(allEpisodeBindingsPool, episode);

                strictEqual(mappedTo.length, 1, episode.episodeNumber + '');
                notStrictEqual(mappedTo[0].provider, episode.provider);
            }
        },
    );

    test('should sort episode list right', async () => {

        let episodes: Episode[] = [];
        const episode1 = new Episode(1);
        const episode2s1 = new Episode(2, new Season([1]));
        const episode3 = new Episode(3);
        const episode4 = new Episode(4, new Season([1]));
        episode4.type = EpisodeType.SPECIAL;
        const episode1s2 = new Episode(1, new Season([2]));
        const episode2s2 = new Episode(2, new Season([2]));

        episodes.push(episode1);
        episodes.push(episode2s1);
        episodes.push(episode3);
        episodes.push(episode4);
        episodes.push(episode1s2);
        episodes.push(episode2s2);

        episodes = await listHelper.shuffle(episodes);

        // Testing

        const result = EpisodeHelper.sortingEpisodeListByEpisodeNumber(episodes, new Season([1]));

        // Result checking

        strictEqual(result[0], episode1, '0 should be EP01S01');
        strictEqual(result[1], episode2s1, '1 should be EP02S01');
        strictEqual(result[2], episode3, '2 should be EP03S01');
        strictEqual(result[3], episode1s2, '3 should be EP01S02');
        strictEqual(result[4], episode2s2, '4 should be EP02S02');
        strictEqual(result[5], episode4, '5 should be EP04S01');
    });
    describe('sorting episode results', () => {
        test('should sort result container right', async () => {

            const ep2r = new ComperatorResult();
            ep2r.matchAble = 2;
            ep2r.matches = 1;
            const ep1r = new ComperatorResult();
            ep1r.matchAble = 3;
            ep1r.matches = 1;
            const ep2erec = new EpisodeRatedEqualityContainer(ep2r);
            const ep1erec = new EpisodeRatedEqualityContainer(ep1r);
            const sorted = await sortHelper.quickSort([ep1erec, ep2erec], async (a, b) => EpisodeRatedEqualityContainerHelper.sortingEpisodeRatedEqualityContainerByResultPoints(a, b));
            const sorted2 = await sortHelper.quickSort([ep2erec, ep1erec], async (a, b) => EpisodeRatedEqualityContainerHelper.sortingEpisodeRatedEqualityContainerByResultPoints(a, b));
            strictEqual(sorted[0], ep2erec);
            strictEqual(sorted[1], ep1erec);
            strictEqual(sorted2[0], ep2erec);
            strictEqual(sorted2[1], ep1erec);
        });

        test('should sort result container right', async () => {

            const ep2r = new ComperatorResult();
            ep2r.matchAble = 2;
            ep2r.matches = 1;
            const ep1r = new ComperatorResult();
            ep1r.matchAble = 3;
            ep1r.matches = 2;
            const ep2erec = new EpisodeRatedEqualityContainer(ep2r);
            const ep1erec = new EpisodeRatedEqualityContainer(ep1r);

            const sorted = await sortHelper.quickSort([ep1erec, ep2erec], async (a, b) => EpisodeRatedEqualityContainerHelper.sortingEpisodeRatedEqualityContainerByResultPoints(a, b));
            const sorted2 = await sortHelper.quickSort([ep2erec, ep1erec], async (a, b) => EpisodeRatedEqualityContainerHelper.sortingEpisodeRatedEqualityContainerByResultPoints(a, b));
            strictEqual(sorted[0], ep1erec);
            strictEqual(sorted[1], ep2erec);
            strictEqual(sorted2[0], ep1erec);
            strictEqual(sorted2[1], ep2erec);
        });
    });

});

