
import { fail, notStrictEqual, strictEqual } from 'assert';
import ListController from '../../../src/backend/controller/list-controller';
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import Episode from '../../../src/backend/controller/objects/meta/episode/episode';
import { EpisodeType } from '../../../src/backend/controller/objects/meta/episode/episode-type';
import Series from '../../../src/backend/controller/objects/series';
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';
import ComperatorResult from '../../../src/backend/helpFunctions/comperators/comperator-results.ts/comperator-result';
import EpisodeMappingHelper from '../../../src/backend/helpFunctions/episode-mapping-helper/episode-mapping-helper';
import EpisodeRatedEqualityContainer from '../../../src/backend/helpFunctions/episode-mapping-helper/episode-rated-equality-container';
import listHelper from '../../../src/backend/helpFunctions/list-helper';
import ProviderDataWithSeasonInfo from '../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import sortHelper from '../../../src/backend/helpFunctions/sort-helper';
import TestProvider from '../../controller/objects/testClass/testProvider';
import TestHelper from '../../test-helper';
            // tslint:disable: no-string-literal
describe('Episode mapping | Mapping Only', () => {
    const lc = new ListController(true);

    beforeEach(() => {
        TestHelper.mustHaveBefore();
        ProviderList['loadedListProvider'] = [new TestProvider('Test'), new TestProvider('')];
        ProviderList['loadedInfoProvider'] = [];
        MainListManager['mainList'] = [];
    });
    test('should map same episodes length from 2 providers', async () => {
        const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('1', 'testA');
        aProvider.detailEpisodeInfo.push(new Episode(1));
        aProvider.detailEpisodeInfo.push(new Episode(2));
        aProvider.detailEpisodeInfo.push(new Episode(3));

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(aProvider, 1));

        // B Site

        const bProvider = new ListProviderLocalData(1, 'testB');
        bProvider.detailEpisodeInfo.push(new Episode(1, 1));
        bProvider.detailEpisodeInfo.push(new Episode(2, 1));
        bProvider.detailEpisodeInfo.push(new Episode(3, 1));

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(bProvider, 1));

        // Testing

        const episodeMappingInstance = new EpisodeMappingHelper();
        const result = await episodeMappingInstance.generateEpisodeMapping(aSeries);

        // Extract results.

        const aEpisodeInfo1 = result.find((x) => x.id === aProvider.detailEpisodeInfo[0].id);
        const aEpisodeInfo2 = result.find((x) => x.id === aProvider.detailEpisodeInfo[1].id);
        const aEpisodeInfo3 = result.find((x) => x.id === aProvider.detailEpisodeInfo[2].id);

        const bEpisodeInfo1 = result.find((x) => x.id === bProvider.detailEpisodeInfo[0].id);
        const bEpisodeInfo2 = result.find((x) => x.id === bProvider.detailEpisodeInfo[1].id);
        const bEpisodeInfo3 = result.find((x) => x.id === bProvider.detailEpisodeInfo[2].id);

        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3)) {
            fail('not all episodes found in the result');
        } else {
            strictEqual(aEpisodeInfo1.mappedTo.length, 1, 'Episode A1 mapping length should be 1');
            strictEqual(aEpisodeInfo2.mappedTo.length, 1, 'Episode A2 mapping length should be 1');
            strictEqual(aEpisodeInfo3.mappedTo.length, 1, 'Episode A3 mapping length should be 1');

            strictEqual(aEpisodeInfo1.mappedTo[0].id, bEpisodeInfo1.id, `Episode A1 (${aEpisodeInfo1.id}) should have id mapped to Episode B1 (${bEpisodeInfo1.id})`);
            strictEqual(aEpisodeInfo2.mappedTo[0].id, bEpisodeInfo2.id, `Episode A2 (${aEpisodeInfo2.id}) should have id mapped to Episode B2 (${bEpisodeInfo2.id})`);
            strictEqual(aEpisodeInfo3.mappedTo[0].id, bEpisodeInfo3.id, `Episode A3 (${aEpisodeInfo3.id}) should have id mapped to Episode B3 (${bEpisodeInfo3.id})`);

            strictEqual(bEpisodeInfo1.mappedTo.length, 1, 'Episode B1 mapping length should be 1');
            strictEqual(bEpisodeInfo2.mappedTo.length, 1, 'Episode B2 mapping length should be 1');
            strictEqual(bEpisodeInfo3.mappedTo.length, 1, 'Episode B3 mapping length should be 1');

            strictEqual(bEpisodeInfo1.mappedTo[0].id, aEpisodeInfo1.id, 'Episode B1 should have id mapped to Episode A1');
            strictEqual(bEpisodeInfo2.mappedTo[0].id, aEpisodeInfo2.id, 'Episode B2 should have id mapped to Episode A2');
            strictEqual(bEpisodeInfo3.mappedTo[0].id, aEpisodeInfo3.id, 'Episode B3 should have id mapped to Episode A3');
        }
    });

    test('should map same episodes length from 3 providers', async () => {
        const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('1', 'testA');
        aProvider.detailEpisodeInfo.push(new Episode(1));
        aProvider.detailEpisodeInfo.push(new Episode(2));
        aProvider.detailEpisodeInfo.push(new Episode(3));

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(aProvider, 1));

        // B Site

        const bProvider = new ListProviderLocalData('1', 'testB');
        bProvider.detailEpisodeInfo.push(new Episode(1, 1));
        bProvider.detailEpisodeInfo.push(new Episode(2, 1));
        bProvider.detailEpisodeInfo.push(new Episode(3, 1));

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(bProvider, 1));


        // C Site

        const cProvider = new ListProviderLocalData('1', 'testC');
        cProvider.detailEpisodeInfo.push(new Episode(1, 1));
        cProvider.detailEpisodeInfo.push(new Episode(2, 1));
        cProvider.detailEpisodeInfo.push(new Episode(3, 1));

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(cProvider, 1));

        // Testing

        const episodeMappingInstance = new EpisodeMappingHelper();
        const result = await episodeMappingInstance.generateEpisodeMapping(aSeries);

        // Extract results.

        const aEpisodeInfo1 = result.find((x) => x.id === aProvider.detailEpisodeInfo[0].id);
        const aEpisodeInfo2 = result.find((x) => x.id === aProvider.detailEpisodeInfo[1].id);
        const aEpisodeInfo3 = result.find((x) => x.id === aProvider.detailEpisodeInfo[2].id);

        const bEpisodeInfo1 = result.find((x) => x.id === bProvider.detailEpisodeInfo[0].id);
        const bEpisodeInfo2 = result.find((x) => x.id === bProvider.detailEpisodeInfo[1].id);
        const bEpisodeInfo3 = result.find((x) => x.id === bProvider.detailEpisodeInfo[2].id);

        const cEpisodeInfo1 = result.find((x) => x.id === cProvider.detailEpisodeInfo[0].id);
        const cEpisodeInfo2 = result.find((x) => x.id === cProvider.detailEpisodeInfo[1].id);
        const cEpisodeInfo3 = result.find((x) => x.id === cProvider.detailEpisodeInfo[2].id);

        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3 && cEpisodeInfo1 && cEpisodeInfo2 && cEpisodeInfo3)) {
            fail('not all episodes found in the result');
        } else {
            strictEqual(aEpisodeInfo1.mappedTo.length, 2, 'Episode A1 mapping length should be 2');
            strictEqual(aEpisodeInfo2.mappedTo.length, 2, 'Episode A2 mapping length should be 2');
            strictEqual(aEpisodeInfo3.mappedTo.length, 2, 'Episode A3 mapping length should be 2');

            strictEqual(bEpisodeInfo1.mappedTo.length, 2, 'Episode B1 mapping length should be 2');
            strictEqual(bEpisodeInfo2.mappedTo.length, 2, 'Episode B2 mapping length should be 2');
            strictEqual(bEpisodeInfo3.mappedTo.length, 2, 'Episode B3 mapping length should be 2');

            strictEqual(cEpisodeInfo1.mappedTo.length, 2, 'Episode C1 mapping length should be 2');
            strictEqual(cEpisodeInfo2.mappedTo.length, 2, 'Episode C2 mapping length should be 2');
            strictEqual(cEpisodeInfo3.mappedTo.length, 2, 'Episode C3 mapping length should be 2');
        }
    });

    test(
        'should map same episodes length from different providers without detailedEpisodes',
        async () => {
            const aSeries = new Series();

            // A Site

            const aProvider = new InfoProviderLocalData('1', 'testA');
            aProvider.episodes = 250;

            await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(aProvider, 1));

            // B Site

            const bProvider = new ListProviderLocalData('1', 'testB');
            bProvider.episodes = 250;

            await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(bProvider, 1));

            // C Site

            const cProvider = new ListProviderLocalData('1', 'testC');
            cProvider.episodes = 250;

            await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(cProvider, 1));

            // Testing

            const episodeMappingInstance = new EpisodeMappingHelper();
            const result = await episodeMappingInstance.generateEpisodeMapping(aSeries);

            // Result checking
            strictEqual(result.length, 750);
            for (const episode of result) {
                strictEqual(episode.mappedTo.length, 2, episode.episodeNumber + '');
                strictEqual(episode.mappedTo[0].episodeNumber, episode.episodeNumber);
                notStrictEqual(episode.mappedTo[0].provider, episode.provider);
            }
        },
    );

    test('should map episodes length with detailedEpisodes', async () => {
        const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('1', 'testA');
        aProvider.episodes = 3;

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(aProvider, 1));

        // B Site

        const bProvider = new ListProviderLocalData('1', 'testB');
        bProvider.detailEpisodeInfo.push(new Episode(1));
        bProvider.detailEpisodeInfo.push(new Episode(2, 1));
        bProvider.detailEpisodeInfo.push(new Episode(3, 1));

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(bProvider, 1));

        // Testing

        const episodeMappingInstance = new EpisodeMappingHelper();
        const result = await episodeMappingInstance.generateEpisodeMapping(aSeries);

        // Result checking
        strictEqual(result.length, 6);
        for (const episode of result) {
            strictEqual(episode.mappedTo.length, 1);
            strictEqual(episode.mappedTo[0].episodeNumber, episode.episodeNumber);
            notStrictEqual(episode.mappedTo[0].provider, episode.provider);
        }
    });

    test('should map find unmapped episodes in the sequel', async () => {
        const aSeries = new Series();
        const sequelOfaSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('1', 'testA');
        aProvider.episodes = 3;
        aProvider.sequelIds.push(2);

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(aProvider, 1));

        // B Site

        const bProvider = new ListProviderLocalData('1', 'testB');
        bProvider.detailEpisodeInfo.push(new Episode(1));
        bProvider.detailEpisodeInfo.push(new Episode(2, 1));
        bProvider.detailEpisodeInfo.push(new Episode(3, 1));
        bProvider.detailEpisodeInfo.push(new Episode(4, 1));
        bProvider.detailEpisodeInfo.push(new Episode(5, 1));
        bProvider.detailEpisodeInfo.push(new Episode(6, 1));

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(bProvider, 1));


        // Sequel

        const cProvider = new InfoProviderLocalData(2, 'testA');
        cProvider.episodes = 3;

        await sequelOfaSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(cProvider, 2));

        // Testing
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [sequelOfaSeries];
        const episodeMappingInstance = new EpisodeMappingHelper();
        const result = await episodeMappingInstance.generateEpisodeMapping(aSeries);

        // Result checking
        strictEqual(result.length, 9);
        for (const episode of result) {
            strictEqual(episode.mappedTo.length, 1, episode.episodeNumber + '');
            notStrictEqual(episode.mappedTo[0].provider, episode.provider);
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

            await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(aProvider, 1));

            // B Site

            const bProvider = new ListProviderLocalData('1', 'testB');
            bProvider.detailEpisodeInfo.push(new Episode(1));
            bProvider.detailEpisodeInfo.push(new Episode(2, 1));
            bProvider.detailEpisodeInfo.push(new Episode(3, 1));
            bProvider.detailEpisodeInfo.push(new Episode(4, 1));
            bProvider.detailEpisodeInfo.push(new Episode(5, 1));
            bProvider.detailEpisodeInfo.push(new Episode(6, 1));
            bProvider.detailEpisodeInfo.push(new Episode(7, 1));
            bProvider.detailEpisodeInfo.push(new Episode(8, 1));
            bProvider.detailEpisodeInfo.push(new Episode(9, 1));

            await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(bProvider, 1));

            // Sequel

            const cProvider = new InfoProviderLocalData(2, 'testA');
            cProvider.episodes = 3;
            cProvider.sequelIds.push(3);
            await sequelOfaSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(cProvider, 2));

            // Sequel 2

            const dProvider = new InfoProviderLocalData(3, 'testA');
            dProvider.episodes = 3;

            await sequelOfSequelOfaSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(dProvider, 3));

            // Testing
            // tslint:disable-next-line: no-string-literal
            MainListManager['mainList'] = [sequelOfaSeries, sequelOfSequelOfaSeries];
            const episodeMappingInstance = new EpisodeMappingHelper();
            const result = await episodeMappingInstance.generateEpisodeMapping(aSeries);

            // Result checking
            strictEqual(result.length, 12);
            for (const episode of result) {
                strictEqual(episode.mappedTo.length, 1, episode.episodeNumber + '');
                notStrictEqual(episode.mappedTo[0].provider, episode.provider);
            }
        },
    );

    test('should sort episode list right', async () => {

        let episodes: Episode[] = [];
        const episode1 = new Episode(1);
        const episode2s1 = new Episode(2, 1);
        const episode3 = new Episode(3);
        const episode4 = new Episode(4, 1);
        episode4.type = EpisodeType.SPECIAL;
        const episode1s2 = new Episode(1, 2);
        const episode2s2 = new Episode(2, 2);

        episodes.push(episode1);
        episodes.push(episode2s1);
        episodes.push(episode3);
        episodes.push(episode4);
        episodes.push(episode1s2);
        episodes.push(episode2s2);

        episodes = await listHelper.shuffle(episodes);

        // Testing

        const episodeMappingInstance = new EpisodeMappingHelper();
        const result = await episodeMappingInstance.sortingEpisodeListByEpisodeNumber(episodes);

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
            const episodeMappingInstance = new EpisodeMappingHelper();
            const ep2r = new ComperatorResult();
            ep2r.matchAble = 2;
            ep2r.matches = 1;
            const ep1r = new ComperatorResult();
            ep1r.matchAble = 3;
            ep1r.matches = 1;
            const ep2erec = new EpisodeRatedEqualityContainer(ep2r);
            const ep1erec = new EpisodeRatedEqualityContainer(ep1r);
            const sorted = await sortHelper.quickSort([ep1erec, ep2erec], async (a, b) => episodeMappingInstance['sortingEpisodeRatedEqualityContainerByResultPoints'](a, b));
            const sorted2 = await sortHelper.quickSort([ep2erec, ep1erec], async (a, b) => episodeMappingInstance['sortingEpisodeRatedEqualityContainerByResultPoints'](a, b));
            strictEqual(sorted[0], ep2erec);
            strictEqual(sorted[1], ep1erec);
            strictEqual(sorted2[0], ep2erec);
            strictEqual(sorted2[1], ep1erec);
        });
        
        test('should sort result container right', async () => {
            const episodeMappingInstance = new EpisodeMappingHelper();
            const ep2r = new ComperatorResult();
            ep2r.matchAble = 2;
            ep2r.matches = 1;
            const ep1r = new ComperatorResult();
            ep1r.matchAble = 3;
            ep1r.matches = 2;
            const ep2erec = new EpisodeRatedEqualityContainer(ep2r);
            const ep1erec = new EpisodeRatedEqualityContainer(ep1r);

            const sorted = await sortHelper.quickSort([ep1erec, ep2erec], async (a, b) => episodeMappingInstance['sortingEpisodeRatedEqualityContainerByResultPoints'](a, b));
            const sorted2 = await sortHelper.quickSort([ep2erec, ep1erec], async (a, b) => episodeMappingInstance['sortingEpisodeRatedEqualityContainerByResultPoints'](a, b));
            strictEqual(sorted[0], ep1erec);
            strictEqual(sorted[1], ep2erec);
            strictEqual(sorted2[0], ep1erec);
            strictEqual(sorted2[1], ep2erec);
        });
    });

});

