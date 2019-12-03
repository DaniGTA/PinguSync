import ListController from '../../../src/backend/controller/list-controller';

import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';

import MainListLoader from '../../../src/backend/controller/main-list-manager/main-list-loader';

import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';

import TestProvider from '../../controller/objects/testClass/testProvider';

import Series from '../../../src/backend/controller/objects/series';

import { InfoProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/info-provider-local-data';

import Episode from '../../../src/backend/controller/objects/meta/episode/episode';

import EpisodeTitle from '../../../src/backend/controller/objects/meta/episode/episode-title';

import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';

import EpisodeMappingHelper from '../../../src/backend/helpFunctions/episode-mapping-helper/episode-mapping-helper';

import { fail, strictEqual } from 'assert';
import TestHelper from '../../test-helper';

describe('Episode mapping | Name Mapping Tests Only', () => {
    const lc = new ListController(true);

    beforeEach(() => {
        TestHelper.mustHaveBefore();
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = [new TestProvider('Test'), new TestProvider('')];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = [];
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [];
    });

    it('should map by episode name', async () => {
        const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('1', 'testA');
        aProvider.targetSeason = 1;
        aProvider.detailEpisodeInfo.push(new Episode(1, undefined, [new EpisodeTitle('First round')]));
        aProvider.detailEpisodeInfo.push(new Episode(2, undefined, [new EpisodeTitle('Second round')]));
        aProvider.detailEpisodeInfo.push(new Episode(3, undefined, [new EpisodeTitle('Third round')]));

        await aSeries.addProviderDatas(aProvider);

        // B Site

        const bProvider = new ListProviderLocalData('1', 'testB');
        bProvider.targetSeason = 1;
        bProvider.detailEpisodeInfo.push(new Episode(1, 1));
        bProvider.detailEpisodeInfo.push(new Episode(2, 1, [new EpisodeTitle('First round')]));
        bProvider.detailEpisodeInfo.push(new Episode(3, 1, [new EpisodeTitle('Second round')]));
        bProvider.detailEpisodeInfo.push(new Episode(4, 1, [new EpisodeTitle('Third round')]));
        await aSeries.addProviderDatas(bProvider);

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
        const bEpisodeInfo4 = result.find((x) => x.id === bProvider.detailEpisodeInfo[3].id);

        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3 && bEpisodeInfo4)) {
            fail('not all episodes found in the result');
        } else {
            strictEqual(aEpisodeInfo1.mappedTo.length, 1, 'Episode A1 mapping length should be 1');
            strictEqual(aEpisodeInfo2.mappedTo.length, 1, 'Episode A2 mapping length should be 1');
            strictEqual(aEpisodeInfo3.mappedTo.length, 1, 'Episode A3 mapping length should be 1');

            strictEqual(aEpisodeInfo1.mappedTo[0].id, bEpisodeInfo2.id, 'Episode A1 should have id mapped to Episode B2');
            strictEqual(aEpisodeInfo2.mappedTo[0].id, bEpisodeInfo3.id, 'Episode A2 should have id mapped to Episode B3');
            strictEqual(aEpisodeInfo3.mappedTo[0].id, bEpisodeInfo4.id, 'Episode A3 should have id mapped to Episode B4');

            strictEqual(bEpisodeInfo1.mappedTo.length, 0, 'Episode B1 mapping length should be 0');
            strictEqual(bEpisodeInfo2.mappedTo.length, 1, 'Episode B1 mapping length should be 1');
            strictEqual(bEpisodeInfo3.mappedTo.length, 1, 'Episode B1 mapping length should be 1');
            strictEqual(bEpisodeInfo4.mappedTo.length, 1, 'Episode B1 mapping length should be 1');

            strictEqual(bEpisodeInfo2.mappedTo[0].id, aEpisodeInfo1.id, 'Episode B2 should have id mapped to Episode A1');
            strictEqual(bEpisodeInfo3.mappedTo[0].id, aEpisodeInfo2.id, 'Episode B3 should have id mapped to Episode A2');
            strictEqual(bEpisodeInfo4.mappedTo[0].id, aEpisodeInfo3.id, 'Episode B4 should have id mapped to Episode A3');
        }
    });

    it('should map by episode name (false name)', async () => {
        const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('1', 'testA');
        aProvider.targetSeason = 1;
        aProvider.detailEpisodeInfo.push(new Episode(1, undefined, [new EpisodeTitle('First round')]));
        aProvider.detailEpisodeInfo.push(new Episode(2, undefined, [new EpisodeTitle('Second round')]));
        aProvider.detailEpisodeInfo.push(new Episode(3, undefined, [new EpisodeTitle('Third round')]));

        await aSeries.addProviderDatas(aProvider);

        // B Site

        const bProvider = new ListProviderLocalData('1', 'testB');
        bProvider.targetSeason = 1;
        bProvider.detailEpisodeInfo.push(new Episode(1, 1, [new EpisodeTitle('Special round')]));
        bProvider.detailEpisodeInfo.push(new Episode(2, 1, [new EpisodeTitle('First round')]));
        bProvider.detailEpisodeInfo.push(new Episode(3, 1, [new EpisodeTitle('Second round')]));
        bProvider.detailEpisodeInfo.push(new Episode(4, 1, [new EpisodeTitle('Thrid round')]));
        await aSeries.addProviderDatas(bProvider);

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
        const bEpisodeInfo4 = result.find((x) => x.id === bProvider.detailEpisodeInfo[3].id);

        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3 && bEpisodeInfo4)) {
            fail('not all episodes found in the result');
        } else {
            strictEqual(aEpisodeInfo1.mappedTo.length, 1, 'Episode A1 mapping length should be 1');
            strictEqual(aEpisodeInfo2.mappedTo.length, 1, 'Episode A2 mapping length should be 1');
            strictEqual(aEpisodeInfo3.mappedTo.length, 1, 'Episode A3 mapping length should be 1');

            strictEqual(aEpisodeInfo1.mappedTo[0].id, bEpisodeInfo2.id, 'Episode A1 should have id mapped to Episode B2');
            strictEqual(aEpisodeInfo2.mappedTo[0].id, bEpisodeInfo3.id, 'Episode A2 should have id mapped to Episode B3');
            strictEqual(aEpisodeInfo3.mappedTo[0].id, bEpisodeInfo4.id, 'Episode A3 should have id mapped to Episode B4');

            strictEqual(bEpisodeInfo1.mappedTo.length, 0, 'Episode B1 mapping length should be 0');
            strictEqual(bEpisodeInfo2.mappedTo.length, 1, 'Episode B2 mapping length should be 1');
            strictEqual(bEpisodeInfo3.mappedTo.length, 1, 'Episode B3 mapping length should be 1');
            strictEqual(bEpisodeInfo4.mappedTo.length, 1, 'Episode B4 mapping length should be 1');

            strictEqual(bEpisodeInfo2.mappedTo[0].id, aEpisodeInfo1.id, 'Episode B2 should have id mapped to Episode A1');
            strictEqual(bEpisodeInfo3.mappedTo[0].id, aEpisodeInfo2.id, 'Episode B3 should have id mapped to Episode A2');
            strictEqual(bEpisodeInfo4.mappedTo[0].id, aEpisodeInfo3.id, 'Episode B4 should have id mapped to Episode A3');
        }
    });

    it('should map by episode name (small info)', async () => {
        const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('1', 'testA');
        aProvider.targetSeason = 1;
        aProvider.detailEpisodeInfo.push(new Episode(1, undefined, [new EpisodeTitle('First round')]));
        aProvider.detailEpisodeInfo.push(new Episode(2));
        aProvider.detailEpisodeInfo.push(new Episode(3));

        await aSeries.addProviderDatas(aProvider);

        // B Site

        const bProvider = new ListProviderLocalData('1', 'testB');
        bProvider.targetSeason = 1;
        bProvider.detailEpisodeInfo.push(new Episode(1, 1, [new EpisodeTitle('Special round')]));
        bProvider.detailEpisodeInfo.push(new Episode(2, 1, [new EpisodeTitle('First round')]));
        bProvider.detailEpisodeInfo.push(new Episode(3, 1));
        bProvider.detailEpisodeInfo.push(new Episode(4, 1));
        await aSeries.addProviderDatas(bProvider);

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
        const bEpisodeInfo4 = result.find((x) => x.id === bProvider.detailEpisodeInfo[3].id);

        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3 && bEpisodeInfo4)) {
            fail('not all episodes found in the result');
        } else {
            strictEqual(aEpisodeInfo1.mappedTo.length, 1, 'Episode A1 mapping length should be 1');
            strictEqual(aEpisodeInfo2.mappedTo.length, 1, 'Episode A2 mapping length should be 1');
            strictEqual(aEpisodeInfo3.mappedTo.length, 1, 'Episode A3 mapping length should be 1');

            strictEqual(aEpisodeInfo1.mappedTo[0].id, bEpisodeInfo2.id, `Episode A1 (${aEpisodeInfo1.id}) should have id mapped to Episode B2 (${bEpisodeInfo2.id})`);
            strictEqual(aEpisodeInfo2.mappedTo[0].id, bEpisodeInfo3.id, `Episode A2 (${aEpisodeInfo2.id}) should have id mapped to Episode B3 (${bEpisodeInfo3.id})`);
            strictEqual(aEpisodeInfo3.mappedTo[0].id, bEpisodeInfo4.id, `Episode A3 (${aEpisodeInfo3.id}) should have id mapped to Episode B4 (${bEpisodeInfo4.id})`);

            strictEqual(bEpisodeInfo1.mappedTo.length, 0, 'Episode B1 mapping length should be 0');
            strictEqual(bEpisodeInfo2.mappedTo.length, 1, 'Episode B2 mapping length should be 1');
            strictEqual(bEpisodeInfo3.mappedTo.length, 1, 'Episode B3 mapping length should be 1');
            strictEqual(bEpisodeInfo4.mappedTo.length, 1, 'Episode B4 mapping length should be 1');

            strictEqual(bEpisodeInfo2.mappedTo[0].id, aEpisodeInfo1.id);
            strictEqual(bEpisodeInfo3.mappedTo[0].id, aEpisodeInfo2.id);
            strictEqual(bEpisodeInfo4.mappedTo[0].id, aEpisodeInfo3.id);
        }
    });

    it('should map by episode name (small info specials)', async () => {
        const aSeries = new Series();

        // A Site

        const aProvider = new InfoProviderLocalData('1', 'testA');
        aProvider.targetSeason = 1;
        aProvider.detailEpisodeInfo.push(new Episode(1, undefined, [new EpisodeTitle('First round')]));
        aProvider.detailEpisodeInfo.push(new Episode(2, undefined, [new EpisodeTitle('Special round')]));
        aProvider.detailEpisodeInfo.push(new Episode(3, undefined, [new EpisodeTitle('Second round')]));

        await aSeries.addProviderDatas(aProvider);

        // B Site

        const bProvider = new ListProviderLocalData('1', 'testB');
        bProvider.targetSeason = 1;
        bProvider.detailEpisodeInfo.push(new Episode(1, 1, [new EpisodeTitle('Special round')]));
        bProvider.detailEpisodeInfo.push(new Episode(2, 1, [new EpisodeTitle('First round')]));
        bProvider.detailEpisodeInfo.push(new Episode(3, 1, [new EpisodeTitle('Second round')]));
        bProvider.detailEpisodeInfo.push(new Episode(4, 1));
        await aSeries.addProviderDatas(bProvider);

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
        const bEpisodeInfo4 = result.find((x) => x.id === bProvider.detailEpisodeInfo[3].id);

        // Result checking
        if (!(aEpisodeInfo1 && aEpisodeInfo2 && aEpisodeInfo3 && bEpisodeInfo1 && bEpisodeInfo2 && bEpisodeInfo3 && bEpisodeInfo4)) {
            fail('not all episodes found in the result');
        } else {
            strictEqual(aEpisodeInfo1.mappedTo.length, 1, 'Episode A1 mapping length should be 1');
            strictEqual(aEpisodeInfo2.mappedTo.length, 1, 'Episode A2 mapping length should be 1');
            strictEqual(aEpisodeInfo3.mappedTo.length, 1, 'Episode A3 mapping length should be 1');

            strictEqual(aEpisodeInfo1.mappedTo[0].id, bEpisodeInfo2.id, 'Episode A1 should have id mapped to Episode B2');
            strictEqual(aEpisodeInfo2.mappedTo[0].id, bEpisodeInfo1.id, 'Episode A2 should have id mapped to Episode B1');
            strictEqual(aEpisodeInfo3.mappedTo[0].id, bEpisodeInfo3.id, 'Episode A3 should have id mapped to Episode B3');

            strictEqual(bEpisodeInfo1.mappedTo.length, 1, 'Episode B1 mapping length should be 1');
            strictEqual(bEpisodeInfo2.mappedTo.length, 1, 'Episode B2 mapping length should be 1');
            strictEqual(bEpisodeInfo3.mappedTo.length, 1, 'Episode B3 mapping length should be 1');
            strictEqual(bEpisodeInfo4.mappedTo.length, 0, 'Episode B4 mapping length should be 0');

            strictEqual(bEpisodeInfo1.mappedTo[0].id, aEpisodeInfo2.id, 'Episode B1 should have id mapped to Episode A2');
            strictEqual(bEpisodeInfo2.mappedTo[0].id, aEpisodeInfo1.id, 'Episode B2 should have id mapped to Episode A1');
            strictEqual(bEpisodeInfo3.mappedTo[0].id, aEpisodeInfo3.id, 'Episode B3 should have id mapped to Episode A3');
        }
    });
});
