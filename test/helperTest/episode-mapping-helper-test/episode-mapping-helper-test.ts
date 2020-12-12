
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
import TestListProvider from '../../controller/objects/testClass/testListProvider';

// tslint:disable: no-string-literal
describe('Episode mapping | Mapping Only', () => {
    beforeEach(() => {
        ProviderList['loadedListProvider'] = [new TestListProvider('Test'), new TestListProvider('')];
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

        aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(aProvider, new Season([1])));

        // B Site

        const bProvider = new ListProviderLocalData(1, 'testB');
        bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1])));

        aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(bProvider, new Season([1])));

        // Testing

        const result = await EpisodeMappingHelper.getEpisodeMappings(aSeries);

        // Extract results.

        const aEpisodeInfo1 = aProvider.getAllDetailedEpisodes()[0];
        const aEpisodeInfo2 = aProvider.getAllDetailedEpisodes()[1];
        const aEpisodeInfo3 = aProvider.getAllDetailedEpisodes()[2];

        const bEpisodeInfo1 = bProvider.getAllDetailedEpisodes()[0];
        const bEpisodeInfo2 = bProvider.getAllDetailedEpisodes()[1];
        const bEpisodeInfo3 = bProvider.getAllDetailedEpisodes()[2];

        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3)) {
            throw new Error('not all episodes found in the result');
        } else {
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1).length).toBe(1);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2).length).toBe(1);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3).length).toBe(1);

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1)[0].id).toBe(bEpisodeInfo1.id);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2)[0].id).toBe(bEpisodeInfo2.id);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3)[0].id).toBe(bEpisodeInfo3.id);

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1).length).toBe(1);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2).length).toBe(1);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3).length).toBe(1);

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1)[0].id).toBe(aEpisodeInfo1.id);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2)[0].id).toBe(aEpisodeInfo2.id);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3)[0].id).toBe(aEpisodeInfo3.id);
        }
    });

    test('should map same episodes length from 3 providers', async () => {
        const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('1', 'testA');
        aProvider.addDetailedEpisodeInfos(new Episode(1));
        aProvider.addDetailedEpisodeInfos(new Episode(2));
        aProvider.addDetailedEpisodeInfos(new Episode(3));

        aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(aProvider, new Season([1])));

        // B Site

        const bProvider = new ListProviderLocalData('1', 'testB');
        bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1])));

        aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(bProvider, new Season([1])));


        // C Site

        const cProvider = new ListProviderLocalData('1', 'testC');
        cProvider.addDetailedEpisodeInfos(new Episode(1, new Season([1])));
        cProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1])));
        cProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1])));

        aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(cProvider, new Season([1])));

        // Testing

        const result = await EpisodeMappingHelper.getEpisodeMappings(aSeries);

        // Extract results.

        const aEpisodeInfo1 = aProvider.getAllDetailedEpisodes()[0];
        const aEpisodeInfo2 = aProvider.getAllDetailedEpisodes()[1];
        const aEpisodeInfo3 = aProvider.getAllDetailedEpisodes()[2];

        const bEpisodeInfo1 = bProvider.getAllDetailedEpisodes()[0];
        const bEpisodeInfo2 = bProvider.getAllDetailedEpisodes()[1];
        const bEpisodeInfo3 = bProvider.getAllDetailedEpisodes()[2];

        const cEpisodeInfo1 = cProvider.getAllDetailedEpisodes()[0];
        const cEpisodeInfo2 = cProvider.getAllDetailedEpisodes()[1];
        const cEpisodeInfo3 = cProvider.getAllDetailedEpisodes()[2];

        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3 && cEpisodeInfo1 && cEpisodeInfo2 && cEpisodeInfo3)) {
            throw new Error('not all episodes found in the result');
        } else {
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1).length).toBe(2);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2).length).toBe(2);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3).length).toBe(2);

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1).length).toBe(2);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2).length).toBe(2);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3).length).toBe(2);

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, cEpisodeInfo1).length).toBe(2);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, cEpisodeInfo2).length).toBe(2);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, cEpisodeInfo3).length).toBe(2);
        }
    });

    test(
        'should map same episodes length from different providers without detailedEpisodes',
        async () => {
            const aSeries = new Series();

            // A Site

            const aProvider = new InfoProviderLocalData('1', 'testA');
            aProvider.episodes = 250;

            aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(aProvider, new Season([1])));

            // B Site

            const bProvider = new ListProviderLocalData('1', 'testB');
            bProvider.episodes = 250;

            aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(bProvider, new Season([1])));

            // C Site

            const cProvider = new ListProviderLocalData('1', 'testC');
            cProvider.episodes = 250;

            aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(cProvider, new Season([1])));

            // Testing

            const result = await EpisodeMappingHelper.getEpisodeMappings(aSeries);

            // Result checking
            for (const episode of aSeries.getAllProviderLocalDatas().flatMap(x => x.getAllDetailedEpisodes())) {
                const mappedTo = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, episode);
                expect(mappedTo.length).toBe(2);
                expect(mappedTo[0].episodeNumber).toBe(episode.episodeNumber);
                expect(mappedTo[0].provider).not.toBe(episode.provider);
            }
        },
    );

    test('should map episodes length with detailedEpisodes', async () => {
        const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('1', 'testA');
        aProvider.episodes = 3;

        aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(aProvider, new Season([1])));

        // B Site

        const bProvider = new ListProviderLocalData('1', 'testB');
        bProvider.addDetailedEpisodeInfos(new Episode(1));
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1])));

        aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(bProvider, new Season([1])));

        // Testing

        const result = await EpisodeMappingHelper.getEpisodeMappings(aSeries);
        // Result checking
        for (const episode of aSeries.getAllProviderLocalDatas().flatMap(x => x.getAllDetailedEpisodes())) {
            const mappedTo = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, episode);

            expect(mappedTo.length).toBe(1);
            expect(mappedTo[0].episodeNumber).toBe(episode.episodeNumber);
            expect(mappedTo[0].provider).not.toBe(episode.provider);
        }
    });

    test('should map find unmapped episodes in the sequel', async () => {
        const aSeries = new Series();
        const sequelOfaSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('1', 'testA');
        aProvider.episodes = 3;
        aProvider.sequelIds.push(2);

        aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(aProvider, new Season([1])));

        // B Site

        const bProvider = new ListProviderLocalData('1', 'testB');
        bProvider.addDetailedEpisodeInfos(new Episode(1));
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(4, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(5, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(6, new Season([1])));

        aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(bProvider, new Season([1])));


        // Sequel

        const cProvider = new InfoProviderLocalData(2, 'testA');
        cProvider.episodes = 3;

        sequelOfaSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(cProvider, new Season([2])));
        sequelOfaSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(bProvider, new Season([1])));

        // Testing
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [aSeries, sequelOfaSeries];

        await MainListManager.finishListFilling();

        // Result checking
        const allEpisodeBindingsPool = (MainListManager.getMainList()).flatMap((x) => x.episodeBindingPools);

        for (const episode of aSeries.getAllProviderLocalDatas().flatMap(x => x.getAllDetailedEpisodes())) {
            const mappedTo = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(allEpisodeBindingsPool, episode);
            expect(mappedTo.length).toBe(1);
            expect(mappedTo[0].provider).not.toBe(episode.provider);
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

            aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(aProvider, new Season([1])));

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

            aSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(bProvider, new Season([1])));

            // Sequel

            const cProvider = new InfoProviderLocalData(2, 'testA');
            cProvider.episodes = 3;
            cProvider.sequelIds.push(3);
            sequelOfaSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(cProvider, new Season([2])));
            sequelOfaSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(bProvider, new Season([2])));


            // Sequel 2

            const dProvider = new InfoProviderLocalData(3, 'testA');
            dProvider.episodes = 3;

            sequelOfSequelOfaSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(dProvider, new Season([3])));
            sequelOfSequelOfaSeries.addProviderDatasWithSeasonInfos(new ProviderLocalDataWithSeasonInfo(bProvider, new Season([3])));


            // Testing
            // tslint:disable-next-line: no-string-literal
            MainListManager['mainList'] = [aSeries, sequelOfaSeries, sequelOfSequelOfaSeries];

            await MainListManager.finishListFilling();

            const allEpisodeBindingsPool = (MainListManager.getMainList()).flatMap((x) => x.episodeBindingPools);

            // Result checking
            for (const episode of aSeries.getAllProviderLocalDatas().flatMap(x => x.getAllDetailedEpisodes())) {
                const mappedTo = EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(allEpisodeBindingsPool, episode);

                expect(mappedTo.length).toBe(1);
                expect(mappedTo[0].provider).not.toBe(episode.provider);
            }
        },
    );

    test('should sort episode list right', () => {

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

        episodes = listHelper.shuffle(episodes);

        // Testing

        const result = EpisodeHelper.sortingEpisodeListByEpisodeNumber(episodes, new Season([1]));

        // Result checking

        expect(result[0]).toBe(episode1);
        expect(result[1]).toBe(episode2s1);
        expect(result[2]).toBe(episode3);
        expect(result[3]).toBe(episode1s2);
        expect(result[4]).toBe(episode2s2);
        expect(result[5]).toBe(episode4);
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
            expect(sorted[0]).toBe(ep2erec);
            expect(sorted[1]).toBe(ep1erec);
            expect(sorted2[0]).toBe(ep2erec);
            expect(sorted2[1]).toBe(ep1erec);
        });

        test('should sort result container right 2', async () => {

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
            expect(sorted[0]).toBe(ep1erec);
            expect(sorted[1]).toBe(ep2erec);
            expect(sorted2[0]).toBe(ep1erec);
            expect(sorted2[1]).toBe(ep2erec);
        });
    });

});

