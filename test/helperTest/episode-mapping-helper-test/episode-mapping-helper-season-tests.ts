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
import TestListProvider from '../../controller/objects/testClass/testListProvider';

describe('Episode mapping | Season Mapping Tests Only', () => {
    beforeEach(() => {
        // tslint:disable: no-string-literal
        ProviderList['loadedListProvider'] = [new TestListProvider('Test'), new TestListProvider('')];
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

        aSeries.addProviderDatas(aProvider);

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

        aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(bProvider, new Season([1])));

        // Testing

        const result = await EpisodeMappingHelper.getEpisodeMappings(aSeries);

        // Extract results.

        const aEpisodeInfo1 = aProvider.getAllDetailedEpisodes()[0];
        const aEpisodeInfo2 = aProvider.getAllDetailedEpisodes()[1];
        const aEpisodeInfo3 = aProvider.getAllDetailedEpisodes()[2];


        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3)) {
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

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1s2).length).toBe(0);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2s2).length).toBe(0);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3s2).length).toBe(0);

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1)[0].id).toBe(aEpisodeInfo1.id);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2)[0].id).toBe(aEpisodeInfo2.id);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3)[0].id).toBe(aEpisodeInfo3.id);
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

        aSeries.addProviderDatas(aProvider);

        // B Site

        const bProvider = new ListProviderLocalData('1', 'testB');
        bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([2])));
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([2])));
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([2])));
        aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(bProvider, new Season([1])));

        // Testing

        const result = await EpisodeMappingHelper.getEpisodeMappings(aSeries);

        // Extract results.

        const aEpisodeInfo1 = aProvider.getAllDetailedEpisodes()[0];
        const aEpisodeInfo2 = aProvider.getAllDetailedEpisodes()[1];
        const aEpisodeInfo3 = aProvider.getAllDetailedEpisodes()[2];

        const bEpisodeInfo1 = bProvider.getAllDetailedEpisodes()[0];
        const bEpisodeInfo2 = bProvider.getAllDetailedEpisodes()[1];
        const bEpisodeInfo3 = bProvider.getAllDetailedEpisodes()[2];

        const bEpisodeInfo1s2 = bProvider.getAllDetailedEpisodes()[3];
        const bEpisodeInfo2s2 = bProvider.getAllDetailedEpisodes()[4];
        const bEpisodeInfo3s2 = bProvider.getAllDetailedEpisodes()[5];

        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3 && bEpisodeInfo1s2 && bEpisodeInfo2s2 && bEpisodeInfo3s2)) {
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

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1s2).length).toBe(0);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2s2).length).toBe(0);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3s2).length).toBe(0);

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1)[0].id).toBe(aEpisodeInfo1.id);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2)[0].id).toBe(aEpisodeInfo2.id);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3)[0].id).toBe(aEpisodeInfo3.id);
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

        aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(aProvider, new Season([2])));

        // B Site

        const bProvider = new ListProviderLocalData('1', 'testB');
        bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([2])));
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([2])));
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([2])));
        aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(bProvider, new Season([2])));

        // Testing

        const result = await EpisodeMappingHelper.getEpisodeMappings(aSeries);

        // Extract results.

        const aEpisodeInfo1 = aProvider.getAllDetailedEpisodes()[0];
        const aEpisodeInfo2 = aProvider.getAllDetailedEpisodes()[1];
        const aEpisodeInfo3 = aProvider.getAllDetailedEpisodes()[2];

        const bEpisodeInfo1 = bProvider.getAllDetailedEpisodes()[0];
        const bEpisodeInfo2 = bProvider.getAllDetailedEpisodes()[1];
        const bEpisodeInfo3 = bProvider.getAllDetailedEpisodes()[2];

        const bEpisodeInfo1s2 = bProvider.getAllDetailedEpisodes()[3];
        const bEpisodeInfo2s2 = bProvider.getAllDetailedEpisodes()[4];
        const bEpisodeInfo3s2 = bProvider.getAllDetailedEpisodes()[5];

        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3 && bEpisodeInfo1s2 && bEpisodeInfo2s2 && bEpisodeInfo3s2)) {
            throw new Error('not all episodes found in the result');
        } else {
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1).length).toBe(1);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2).length).toBe(1);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3).length).toBe(1);

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1)[0].id).toBe(bEpisodeInfo1s2.id);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2)[0].id).toBe(bEpisodeInfo2s2.id);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3)[0].id).toBe(bEpisodeInfo3s2.id);

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1).length).toBe(0);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2).length).toBe(0);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3).length).toBe(0);

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1s2).length).toBe(1);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2s2).length).toBe(1);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3s2).length).toBe(1);

            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1s2)[0].id).toBe(aEpisodeInfo1.id);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2s2)[0].id).toBe(aEpisodeInfo2.id);
            expect(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3s2)[0].id).toBe(aEpisodeInfo3.id);
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

            aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(aProvider));

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
            aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(bProvider, new Season([1])));

            // Testing

            const result = await EpisodeMappingHelper.getEpisodeMappings(aSeries);

            // Extract results.

            const aEpisodeInfo1 = aProvider.getAllDetailedEpisodes()[0];
            const aEpisodeInfo2 = aProvider.getAllDetailedEpisodes()[1];
            const aEpisodeInfo3 = aProvider.getAllDetailedEpisodes()[2];

            const bEpisodeInfo1s0 = bProvider.getAllDetailedEpisodes()[0];
            const bEpisodeInfo2s0 = bProvider.getAllDetailedEpisodes()[1];
            const bEpisodeInfo3s0 = bProvider.getAllDetailedEpisodes()[2];

            const bEpisodeInfo1s1 = bProvider.getAllDetailedEpisodes()[3];
            const bEpisodeInfo2s1 = bProvider.getAllDetailedEpisodes()[4];
            const bEpisodeInfo3s1 = bProvider.getAllDetailedEpisodes()[5];

            const bEpisodeInfo1s2 = bProvider.getAllDetailedEpisodes()[6];
            const bEpisodeInfo2s2 = bProvider.getAllDetailedEpisodes()[7];
            const bEpisodeInfo3s2 = bProvider.getAllDetailedEpisodes()[8];

            // Result checking

            const eph = EpisodeBindingPoolHelper;
            expect(eph.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1).length).toBe(1);
            expect(eph.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2).length).toBe(1);
            expect(eph.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3).length).toBe(1);

            expect(eph.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1)[0].id).toBe(bEpisodeInfo1s1?.id);
            expect(eph.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2)[0].id).toBe(bEpisodeInfo2s1?.id);
            expect(eph.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3)[0].id).toBe(bEpisodeInfo3s1?.id);

            expect(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1s0)?.length).toBe(0);
            expect(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2s0)?.length).toBe(0);
            expect(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3s0)?.length).toBe(0);

            expect(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1s1)?.length).toBe(1);
            expect(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2s1)?.length).toBe(1);
            expect(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3s1)?.length).toBe(1);

            expect(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1s2)?.length).toBe(0);
            expect(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2s2)?.length).toBe(0);
            expect(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3s2)?.length).toBe(0);

            expect(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1s1)[0]?.id).toBe(aEpisodeInfo1?.id);
            expect(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2s1)[0]?.id).toBe(aEpisodeInfo2?.id);
            expect(eph.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3s1)[0]?.id).toBe(aEpisodeInfo3?.id);

        },
    );
});
