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


describe('Episode mapping | Name Mapping Tests Only', () => {

    beforeEach(() => {
        // tslint:disable: no-string-literal
        ProviderList['loadedListProvider'] = [new TestProvider('Test'), new TestProvider('')];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = [];
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [];
        ProviderDataListManager['providerDataList'] = [];
    });

    test('should map by episode name', async () => {
        const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('1', 'testA');
        aProvider.addDetailedEpisodeInfos(new Episode(1, undefined, [new EpisodeTitle('First round')]));
        aProvider.addDetailedEpisodeInfos(new Episode(2, undefined, [new EpisodeTitle('Second round')]));
        aProvider.addDetailedEpisodeInfos(new Episode(3, undefined, [new EpisodeTitle('Third round')]));

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(aProvider, new Season([1])));

        // B Site

        const bProvider = new ListProviderLocalData('1', 'testB');
        bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1]), [new EpisodeTitle('First round')]));
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1]), [new EpisodeTitle('Second round')]));
        bProvider.addDetailedEpisodeInfos(new Episode(4, new Season([1]), [new EpisodeTitle('Third rounds')]));
        await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(bProvider, new Season([1])));

        // Testing

        const result = await EpisodeMappingHelper.getEpisodeMappings(aSeries);

        // Extract results.

        const aEpisodeInfo1 = aProvider.detailEpisodeInfo.find((x) => x.id === aProvider.detailEpisodeInfo[0].id);
        const aEpisodeInfo2 = aProvider.detailEpisodeInfo.find((x) => x.id === aProvider.detailEpisodeInfo[1].id);
        const aEpisodeInfo3 = aProvider.detailEpisodeInfo.find((x) => x.id === aProvider.detailEpisodeInfo[2].id);

        const bEpisodeInfo1 = bProvider.detailEpisodeInfo.find((x) => x.id === bProvider.detailEpisodeInfo[0].id);
        const bEpisodeInfo2 = bProvider.detailEpisodeInfo.find((x) => x.id === bProvider.detailEpisodeInfo[1].id);
        const bEpisodeInfo3 = bProvider.detailEpisodeInfo.find((x) => x.id === bProvider.detailEpisodeInfo[2].id);
        const bEpisodeInfo4 = bProvider.detailEpisodeInfo.find((x) => x.id === bProvider.detailEpisodeInfo[3].id);

        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3 && bEpisodeInfo4)) {
            fail('not all episodes found in the result');
        } else {
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1).length, 1, 'Episode A1 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2).length, 1, 'Episode A2 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3).length, 1, 'Episode A3 mapping length should be 1');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1)[0].id, bEpisodeInfo2.id, 'Episode A1 should have id mapped to Episode B2');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2)[0].id, bEpisodeInfo3.id, 'Episode A2 should have id mapped to Episode B3');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3)[0].id, bEpisodeInfo4.id, 'Episode A3 should have id mapped to Episode B4');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1).length, 0, 'Episode B1 mapping length should be 0');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2).length, 1, 'Episode B1 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3).length, 1, 'Episode B1 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo4).length, 1, 'Episode B1 mapping length should be 1');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2)[0].id, aEpisodeInfo1.id, 'Episode B2 should have id mapped to Episode A1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3)[0].id, aEpisodeInfo2.id, 'Episode B3 should have id mapped to Episode A2');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo4)[0].id, aEpisodeInfo3.id, 'Episode B4 should have id mapped to Episode A3');
        }
    });


    test('should map random wrong name but right order', async () => {
        const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('1', 'testA');
        aProvider.addDetailedEpisodeInfos(new Episode(2, undefined, [new EpisodeTitle('First round')]));
        aProvider.addDetailedEpisodeInfos(new Episode(3, undefined, [new EpisodeTitle('Second round')]));
        aProvider.addDetailedEpisodeInfos(new Episode(4, undefined, [new EpisodeTitle('Third round')]));

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(aProvider, new Season([1])));

        // B Site

        const bProvider = new ListProviderLocalData('1', 'testB');
        bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([1]), [new EpisodeTitle('First round')]));
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1]), [new EpisodeTitle('Seconds rounds')]));
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1]), [new EpisodeTitle('Third round')]));
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

        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3)) {
            fail('not all episodes found in the result');
        } else {
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3).length, 1, 'Episode A3 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1).length, 1, 'Episode A1 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2).length, 1, 'Episode A2 mapping length should be 1');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1)[0].id, bEpisodeInfo1.id, 'Episode A1 should have id mapped to Episode B2');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2)[0].id, bEpisodeInfo2.id, 'Episode A2 should have id mapped to Episode B3');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3)[0].id, bEpisodeInfo3.id, 'Episode A3 should have id mapped to Episode B4');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1).length, 1, 'Episode B1 mapping length should be 0');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2).length, 1, 'Episode B1 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3).length, 1, 'Episode B1 mapping length should be 1');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1)[0].id, aEpisodeInfo1.id, 'Episode B2 should have id mapped to Episode A1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2)[0].id, aEpisodeInfo2.id, 'Episode B3 should have id mapped to Episode A2');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3)[0].id, aEpisodeInfo3.id, 'Episode B4 should have id mapped to Episode A3');
        }
    });

    test('should map by episode name (false name)', async () => {
        const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('1', 'testA');
        aProvider.addDetailedEpisodeInfos(new Episode(1, undefined, [new EpisodeTitle('First round')]));
        aProvider.addDetailedEpisodeInfos(new Episode(2, undefined, [new EpisodeTitle('Second round')]));
        aProvider.addDetailedEpisodeInfos(new Episode(3, undefined, [new EpisodeTitle('Third round')]));

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(aProvider, new Season([1])));
        // B Site

        const bProvider = new ListProviderLocalData('1', 'testB');
        bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([1]), [new EpisodeTitle('Special round')]));
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1]), [new EpisodeTitle('First round')]));
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1]), [new EpisodeTitle('Second round')]));
        bProvider.addDetailedEpisodeInfos(new Episode(4, new Season([1]), [new EpisodeTitle('Thrid round')]));
        await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(bProvider, new Season([1])));

        // Testing

        const result = await EpisodeMappingHelper.getEpisodeMappings(aSeries);

        // Extract results.

        const aEpisodeInfo1 = aProvider.detailEpisodeInfo[0];
        const aEpisodeInfo2 = aProvider.detailEpisodeInfo[1];
        const aEpisodeInfo3 = aProvider.detailEpisodeInfo[2];

        const bEpisodeInfo1 = bProvider.detailEpisodeInfo[0];
        const bEpisodeInfo3 = bProvider.detailEpisodeInfo[2];
        const bEpisodeInfo4 = bProvider.detailEpisodeInfo[3];
        const bEpisodeInfo2 = bProvider.detailEpisodeInfo[1];

        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3 && bEpisodeInfo4)) {
            fail('not all episodes found in the result');
        } else {
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1).length, 1, 'Episode A1 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2).length, 1, 'Episode A2 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3).length, 1, 'Episode A3 mapping length should be 1');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1)[0].id, bEpisodeInfo2.id, 'Episode A1 should have id mapped to Episode B2');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2)[0].id, bEpisodeInfo3.id, 'Episode A2 should have id mapped to Episode B3');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3)[0].id, bEpisodeInfo4.id, 'Episode A3 should have id mapped to Episode B4');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1).length, 0, 'Episode B1 mapping length should be 0');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2).length, 1, 'Episode B2 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3).length, 1, 'Episode B3 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo4).length, 1, 'Episode B4 mapping length should be 1');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2)[0].id, aEpisodeInfo1.id, 'Episode B2 should have id mapped to Episode A1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3)[0].id, aEpisodeInfo2.id, 'Episode B3 should have id mapped to Episode A2');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo4)[0].id, aEpisodeInfo3.id, 'Episode B4 should have id mapped to Episode A3');
        }
    });

    test('should map by episode name (small info)', async () => {
        const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('1', 'testA');
        aProvider.addDetailedEpisodeInfos(new Episode(1, undefined, [new EpisodeTitle('First round')]));
        aProvider.addDetailedEpisodeInfos(new Episode(2));
        aProvider.addDetailedEpisodeInfos(new Episode(3));

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(aProvider, new Season([1])));

        // B Site

        const bProvider = new ListProviderLocalData('1', 'testB');
        bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([1]), [new EpisodeTitle('Special round')]));
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1]), [new EpisodeTitle('First round')]));
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1])));
        bProvider.addDetailedEpisodeInfos(new Episode(4, new Season([1])));
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
        const bEpisodeInfo4 = bProvider.detailEpisodeInfo[3];

        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3 && bEpisodeInfo4)) {
            fail('not all episodes found in the result');
        } else {
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1).length, 1, 'Episode A1 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2).length, 1, 'Episode A2 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3).length, 1, 'Episode A3 mapping length should be 1');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1)[0].id, bEpisodeInfo2.id, `Episode A1 (${aEpisodeInfo1.id}) should have id mapped to Episode B2 (${bEpisodeInfo2.id})`);
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2)[0].id, bEpisodeInfo3.id, `Episode A2 (${aEpisodeInfo2.id}) should have id mapped to Episode B3 (${bEpisodeInfo3.id})`);
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3)[0].id, bEpisodeInfo4.id, `Episode A3 (${aEpisodeInfo3.id}) should have id mapped to Episode B4 (${bEpisodeInfo4.id})`);

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1).length, 0, 'Episode B1 mapping length should be 0');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2).length, 1, 'Episode B2 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3).length, 1, 'Episode B3 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo4).length, 1, 'Episode B4 mapping length should be 1');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2)[0].id, aEpisodeInfo1.id);
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3)[0].id, aEpisodeInfo2.id);
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo4)[0].id, aEpisodeInfo3.id);
        }
    });

    test('should map by episode name (small info specials)', async () => {
        const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('1', 'testA');
        aProvider.addDetailedEpisodeInfos(new Episode(1, undefined, [new EpisodeTitle('First round')]));
        aProvider.addDetailedEpisodeInfos(new Episode(2, undefined, [new EpisodeTitle('Special round')]));
        aProvider.addDetailedEpisodeInfos(new Episode(3, undefined, [new EpisodeTitle('Second round')]));

        await aSeries.addProviderDatasWithSeasonInfos(new ProviderDataWithSeasonInfo(aProvider, new Season([1])));

        // B Site

        const bProvider = new ListProviderLocalData('1', 'testB');
        bProvider.addDetailedEpisodeInfos(new Episode(1, new Season([1]), [new EpisodeTitle('Special round')]));
        bProvider.addDetailedEpisodeInfos(new Episode(2, new Season([1]), [new EpisodeTitle('First round')]));
        bProvider.addDetailedEpisodeInfos(new Episode(3, new Season([1]), [new EpisodeTitle('Second round')]));
        bProvider.addDetailedEpisodeInfos(new Episode(4, new Season([1])));
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
        const bEpisodeInfo4 = bProvider.detailEpisodeInfo[3];

        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3 && bEpisodeInfo4)) {
            fail('not all episodes found in the result');
        } else {
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1).length, 1, 'Episode A1 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2).length, 1, 'Episode A2 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3).length, 1, 'Episode A3 mapping length should be 1');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo1)[0].id, bEpisodeInfo2.id, 'Episode A1 should have id mapped to Episode B2');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo2)[0].id, bEpisodeInfo1.id, 'Episode A2 should have id mapped to Episode B1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, aEpisodeInfo3)[0].id, bEpisodeInfo3.id, 'Episode A3 should have id mapped to Episode B3');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1).length, 1, 'Episode B1 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2).length, 1, 'Episode B2 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3).length, 1, 'Episode B3 mapping length should be 1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo4).length, 0, 'Episode B4 mapping length should be 0');

            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo1)[0].id, aEpisodeInfo2.id, 'Episode B1 should have id mapped to Episode A2');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo2)[0].id, aEpisodeInfo1.id, 'Episode B2 should have id mapped to Episode A1');
            strictEqual(EpisodeBindingPoolHelper.getAllBindedEpisodesOfEpisode(result, bEpisodeInfo3)[0].id, aEpisodeInfo3.id, 'Episode B3 should have id mapped to Episode A3');
        }
    });
});
