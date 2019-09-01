

import { strictEqual } from 'assert';
import providerHelper from '../../../src/backend/helpFunctions/provider/provider-helper';
import Series from '../../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../../src/backend/controller/objects/list-provider-local-data';
import Name from '../../../src/backend/controller/objects/meta/name';
import TraktProvider from '../../../src/backend/api/trakt/trakt-provider';
import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';

describe('Trakt Tests', () => {
    const traktProvider = new TraktProvider();

    before(() => {
        ProviderList['loadedListProvider'] = undefined;
        ProviderList['loadedInfoProvider'] = undefined;
    })
    
    it('should get a series (1/5)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData();
        unkownProvider.addSeriesName(new Name("Sankarea", "en"));
        series.addProviderDatas(unkownProvider);

        const result = await providerHelper['getProviderSeriesInfo'](series, traktProvider);
        strictEqual(result.getListProvidersInfos().length, 2);
    })

    it('should get a series (2/5)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData();
        unkownProvider.addSeriesName(new Name("Seitokai Yakuindomo＊", "en"));
        series.addProviderDatas(unkownProvider);

        const result = await providerHelper['getProviderSeriesInfo'](series, traktProvider);
        strictEqual(result.getListProvidersInfos().length, 2);
    })

        it('should get a series (3/5)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData();
        unkownProvider.addSeriesName(new Name("The Asterisk War: The Academy City on the Water", "en"));
        series.addProviderDatas(unkownProvider);

        const result = await providerHelper['getProviderSeriesInfo'](series, traktProvider);
        strictEqual(result.getListProvidersInfos().length, 2);
        })
    
        it('should get a series (4/5)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData();
        unkownProvider.addSeriesName(new Name("Little Witch Academia", "en"));
        series.addProviderDatas(unkownProvider);

        const result = await providerHelper['getProviderSeriesInfo'](series, traktProvider);
        strictEqual(result.getListProvidersInfos().length, 2);
        })
    
        it('should get a series (5/5)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData();
        unkownProvider.addSeriesName(new Name("Avatar: The Last Airbender", "en"));
        series.addProviderDatas(unkownProvider);

        const result = await providerHelper['getProviderSeriesInfo'](series, traktProvider);
        strictEqual(result.getListProvidersInfos().length, 2);
    })

});
