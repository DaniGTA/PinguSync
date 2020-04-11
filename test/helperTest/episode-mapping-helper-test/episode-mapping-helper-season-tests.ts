import { fail, strictEqual } from 'assert';
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import Episode from '../../../src/backend/controller/objects/meta/episode/episode';
import EpisodeTitle from '../../../src/backend/controller/objects/meta/episode/episode-title';
import Season from '../../../src/backend/controller/objects/meta/season';
import Series from '../../../src/backend/controller/objects/series';
import ProviderDataListManager from '../../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager';
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import EpisodeBindingPoolHelper from '../../../src/backend/helpFunctions/episode-binding-pool-helper';
import EpisodeMappingHelper from '../../../src/backend/helpFunctions/episode-mapping-helper/episode-mapping-helper';
import ProviderDataWithSeasonInfo from '../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-data-with-season-info';
import TestProvider from '../../controller/objects/testClass/testProvider';





describe('Episode mapping | Season Mapping Tests Only', () => {
    beforeEach(() => {
        // tslint:disable: no-string-literal
        ProviderList['loadedListProvider'] = [new TestProvider('Test'), new TestProvider('')];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = [];
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [];
        ProviderDataListManager['providerDataList'] = [];
    });

    test('should map episode with right season (1/3)', async () => {
        const aSeries = new Series();
        // A Site

        const aProvider = new InfoProviderLocalData('1', 'testA');
        aProvider.addDetailedEpisodeInfos(new Episode(1, undefined, [new EpisodeTitle('First round')]));
        aProvider.addDetailedEpisodeInfos(new Episode(2, undefined, [new EpisodeTitle('Special round')]));
        aProvider.addDetailedEpisodeInfos(new Episode(3, undefined, [new EpisodeTitle('Second round')]));

        await aSeries.addProviderDatas(aProvider);

        // B Site

        const bProvider = new ListProviderLocalData('1', 'testB');

        const bEpisodeInfo1s2 = new Episode(1, new Season([2]));
        const bEpisodeInfo2s2 = new Episode(2, new Season([2]));
        const bEpisodeInfo3s2 = new Episode(3, new Season([2]));

        bProvider.addDetailedEpisodeInfos(bEpisodeInfo1s2);
        bProvider.addDetailedEpisodeInfos(bEpisodeInfo2s2);
        bProvider.addDetailedEpisodeInfos(bEpisodeInfo3s2);

        const bEpisodeInfo1 = new Episode(1, new Season([1]));
        const bEpisodeInfo2 = new Episode(2, new Season([1]));
        const bEpisodeInfo3 = new Episode(3, new Season([1]));

        bProvider.addDetailedEpisodeInfos(bEpisodeInfo1);
        bProvider.addDetailedEpisodeInfos(bEpisodeInfo2);
        bProvider.addDetailedEpisodeInfos(bEpisodeInfo3);

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(bProvider, new Season([1])));

        // Testing

        const result = await EpisodeMappingHelper.getEpisodeMappings(aSeries);

        // Extract results.

        const aEpisodeInfo1 = aProvider.detailEpisodeInfo[0];
        const aEpisodeInfo2 = aProvider.detailEpisodeInfo[1];
        const aEpisodeInfo3 = aProvider.detailEpisodeInfo[2];


        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3)) {
            fail('not all episodes found in the result');
        } else {
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1).length, 1, 'Episode A1 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2).length, 1, 'Episode A2 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3).length, 1, 'Episode A3 mapping length should be 1');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1)[0].id, bEpisodeInfo1.id, 'Episode A1 should have id mapped to Episode B1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2)[0].id, bEpisodeInfo2.id, 'Episode A2 should have id mapped to Episode B2');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3)[0].id, bEpisodeInfo3.id, 'Episode A3 should have id mapped to Episode B3');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1).length, 1, 'Episode B1 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2).length, 1, 'Episode B2 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3).length, 1, 'Episode B3 mapping length should be 1');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1s2).length, 0, 'Episode B1 mapping length should be 0');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2s2).length, 0, 'Episode B2 mapping length should be 0');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3s2).length, 0, 'Episode B3 mapping length should be 0');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1)[0].id, aEpisodeInfo1.id, 'Episode B1 should have id mapped to Episode A1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2)[0].id, aEpisodeInfo2.id, 'Episode B2 should have id mapped to Episode A2');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3)[0].id, aEpisodeInfo3.id, 'Episode B3 should have id mapped to Episode A3');
        }
    });

    test('should map episode with right season (2/3)', async () => {
        const aSeries = new Series();
        // tslint:disable-next-line: no-string-literal
        aSeries['cachedSeason'] = new Season([1]);
        // A Site

        const aProvider = new InfoProviderLocalData('1', 'testA');
        aProvider.addDetailedEpisodeInfos(new Episode(1, undefined, [new EpisodeTitle('First round')]));
        aProvider.addDetailedEpisodeInfos(new Episode(2, undefined, [new EpisodeTitle('Special round')]));
        aProvider.addDetailedEpisodeInfos(new Episode(3, undefined, [new EpisodeTitle('Second round')]));

        await aSeries.addProviderDatas(aProvider);

        // B Site

        const bProvider = new ListProviderLocalData('1', 'testB');
        bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([2])));
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([2])));
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([2])));
        await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(bProvider, new Season([1])));

        // Testing

        const result = await EpisodeMappingHelper.getEpisodeMappings(aSeries);

        // Extract results.

        const aEpisodeInfo1 = aProvider.detailEpisodeInfo[0];
        const aEpisodeInfo2 = aProvider.detailEpisodeInfo[1];
        const aEpisodeInfo3 = aProvider.detailEpisodeInfo[2];

        const bEpisodeInfo1 = bProvider.detailEpisodeInfo[0];
        const bEpisodeInfo2 = bProvider.detailEpisodeInfo[1];
        const bEpisodeInfo3 = bProvider.detailEpisodeInfo[2];

        const bEpisodeInfo1s2 = bProvider.detailEpisodeInfo[3];
        const bEpisodeInfo2s2 = bProvider.detailEpisodeInfo[4];
        const bEpisodeInfo3s2 = bProvider.detailEpisodeInfo[5];

        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3 && bEpisodeInfo1s2 && bEpisodeInfo2s2 && bEpisodeInfo3s2)) {
            fail('not all episodes found in the result');
        } else {
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1).length, 1, 'Episode A1 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2).length, 1, 'Episode A2 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3).length, 1, 'Episode A3 mapping length should be 1');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1)[0].id, bEpisodeInfo1.id, 'Episode A1 should have id mapped to Episode B1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2)[0].id, bEpisodeInfo2.id, 'Episode A2 should have id mapped to Episode B2');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3)[0].id, bEpisodeInfo3.id, 'Episode A3 should have id mapped to Episode B3');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1).length, 1, 'Episode B1 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2).length, 1, 'Episode B2 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3).length, 1, 'Episode B3 mapping length should be 1');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1s2).length, 0, 'Episode B1 mapping length should be 0');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2s2).length, 0, 'Episode B2 mapping length should be 0');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3s2).length, 0, 'Episode B3 mapping length should be 0');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1)[0].id, aEpisodeInfo1.id, 'Episode B1 should have id mapped to Episode A1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2)[0].id, aEpisodeInfo2.id, 'Episode B2 should have id mapped to Episode A2');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3)[0].id, aEpisodeInfo3.id, 'Episode B3 should have id mapped to Episode A3');
        }
    });

    test('should map episode with right season (3/3)', async () => {
        const aSeries = new Series();
        // tslint:disable-next-line: no-string-literal
        aSeries['cachedSeason'] = new Season([2]);
        // A Site

        const aProvider = new InfoProviderLocalData('1', 'testA');
        aProvider.addDetailedEpisodeInfos(new Episode(1, undefined, [new EpisodeTitle('First round')]));
        aProvider.addDetailedEpisodeInfos(new Episode(2, undefined, [new EpisodeTitle('Special round')]));
        aProvider.addDetailedEpisodeInfos(new Episode(3, undefined, [new EpisodeTitle('Second round')]));

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(aProvider, new Season([2])));

        // B Site

        const bProvider = new ListProviderLocalData('1', 'testB');
        bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([2])));
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([2])));
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([2])));
        await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(bProvider, new Season([2])));

        // Testing

        const result = await EpisodeMappingHelper.getEpisodeMappings(aSeries);

        // Extract results.

        const aEpisodeInfo1 = aProvider.detailEpisodeInfo[0];
        const aEpisodeInfo2 = aProvider.detailEpisodeInfo[1];
        const aEpisodeInfo3 = aProvider.detailEpisodeInfo[2];

        const bEpisodeInfo1 = bProvider.detailEpisodeInfo[0];
        const bEpisodeInfo2 = bProvider.detailEpisodeInfo[1];
        const bEpisodeInfo3 = bProvider.detailEpisodeInfo[2];

        const bEpisodeInfo1s2 = bProvider.detailEpisodeInfo[3];
        const bEpisodeInfo2s2 = bProvider.detailEpisodeInfo[4];
        const bEpisodeInfo3s2 = bProvider.detailEpisodeInfo[5];

        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3 && bEpisodeInfo1s2 && bEpisodeInfo2s2 && bEpisodeInfo3s2)) {
            fail('not all episodes found in the result');
        } else {
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1).length, 1, 'Episode A1 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2).length, 1, 'Episode A2 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3).length, 1, 'Episode A3 mapping length should be 1');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1)[0].id, bEpisodeInfo1s2.id, 'Episode A1 should have id mapped to Episode B1S2');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2)[0].id, bEpisodeInfo2s2.id, 'Episode A2 should have id mapped to Episode B2S2');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3)[0].id, bEpisodeInfo3s2.id, 'Episode A3 should have id mapped to Episode B3S2');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1).length, 0, 'Episode B1 mapping length should be 0');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2).length, 0, 'Episode B2 mapping length should be 0');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3).length, 0, 'Episode B3 mapping length should be 0');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1s2).length, 1, 'Episode B1 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2s2).length, 1, 'Episode B2 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3s2).length, 1, 'Episode B3 mapping length should be 1');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1s2)[0].id, aEpisodeInfo1.id, 'Episode B1 should have id mapped to Episode A1S2');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2s2)[0].id, aEpisodeInfo2.id, 'Episode B2 should have id mapped to Episode A2S2');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3s2)[0].id, aEpisodeInfo3.id, 'Episode B3 should have id mapped to Episode A3S2');
        }
    });

    test(
        'should map episode with right season (Provider is in second season)',
        async () => {
            const aSeries = new Series();
            // tslint:disable-next-line: no-string-literal
            aSeries['cachedSeason'] = new Season([1]);
            // A Site

            const aProvider = new InfoProviderLocalData('1', 'testA');
            aProvider.addDetailedEpisodeInfos(new Episode(1));
            aProvider.addDetailedEpisodeInfos(new Episode(2));
            aProvider.addDetailedEpisodeInfos(new Episode(3));

            await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(aProvider));

            // B Site

            const bProvider = new ListProviderLocalData('1', 'testB');
            bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([0])));
            bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([0])));
            bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([0])));
            bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([1])));
            bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1])));
            bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1])));
            bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([2])));
            bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([2])));
            bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([2])));
            await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(bProvider, new Season([1])));

            // Testing

            const result = await EpisodeMappingHelper.getEpisodeMappings(aSeries);

            // Extract results.

            const aEpisodeInfo1 = aProvider.detailEpisodeInfo[0];
            const aEpisodeInfo2 = aProvider.detailEpisodeInfo[1];
            const aEpisodeInfo3 = aProvider.detailEpisodeInfo[2];

            const bEpisodeInfo1s0 = bProvider.detailEpisodeInfo[0];
            const bEpisodeInfo2s0 = bProvider.detailEpisodeInfo[1];
            const bEpisodeInfo3s0 = bProvider.detailEpisodeInfo[2];

            const bEpisodeInfo1s1 = bProvider.detailEpisodeInfo[3];
            const bEpisodeInfo2s1 = bProvider.detailEpisodeInfo[4];
            const bEpisodeInfo3s1 = bProvider.detailEpisodeInfo[5];

            const bEpisodeInfo1s2 = bProvider.detailEpisodeInfo[6];
            const bEpisodeInfo2s2 = bProvider.detailEpisodeInfo[7];
            const bEpisodeInfo3s2 = bProvider.detailEpisodeInfo[8];

            // Result checking

            const eph = EpisodeBindingPoolHelper;
            strictEqual(eph.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1).length, 1, 'Episode A1 mapping length should be 1');
            strictEqual(eph.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2).length, 1, 'Episode A2 mapping length should be 1');
            strictEqual(eph.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3).length, 1, 'Episode A3 mapping length should be 1');

            strictEqual(eph.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1)[0].id, bEpisodeInfo1s1?.id, 'Episode A1 should have id mapped to Episode B1S1');
            strictEqual(eph.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2)[0].id, bEpisodeInfo2s1?.id, 'Episode A2 should have id mapped to Episode B2S1');
            strictEqual(eph.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3)[0].id, bEpisodeInfo3s1?.id, 'Episode A3 should have id mapped to Episode B3S1');

            strictEqual(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1s0)?.length, 0, 'Episode B1S0 mapping length should be 0');
            strictEqual(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2s0)?.length, 0, 'Episode B2S0 mapping length should be 0');
            strictEqual(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3s0)?.length, 0, 'Episode B3S0 mapping length should be 0');

            strictEqual(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1s1)?.length, 1, 'Episode B1S1 mapping length should be 1');
            strictEqual(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2s1)?.length, 1, 'Episode B2S1 mapping length should be 1');
            strictEqual(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3s1)?.length, 1, 'Episode B3S1 mapping length should be 1');

            strictEqual(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1s2)?.length, 0, 'Episode B1S2 mapping length should be 0');
            strictEqual(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2s2)?.length, 0, 'Episode B2S2 mapping length should be 0');
            strictEqual(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3s2)?.length, 0, 'Episode B3S2 mapping length should be 0');

            strictEqual(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1s1)[0]?.id, aEpisodeInfo1?.id, 'Episode B1S1 should have id mapped to Episode A1');
            strictEqual(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2s1)[0]?.id, aEpisodeInfo2?.id, 'Episode B2S1 should have id mapped to Episode A2');
            strictEqual(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3s1)[0]?.id, aEpisodeInfo3?.id, 'Episode B3S1 should have id mapped to Episode A3');

        },
    );
});
