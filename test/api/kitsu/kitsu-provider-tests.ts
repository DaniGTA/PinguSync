

import { strictEqual } from 'assert';
import KitsuProvider from '../../../src/backend/api/kitsu/kitsu-provider';
import MainListLoader from '../../../src/backend/controller/main-list-manager/main-list-loader';
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import { ListProviderLocalData } from '../../../src/backend/controller/objects/list-provider-local-data';
import Name from '../../../src/backend/controller/objects/meta/name';
import Series from '../../../src/backend/controller/objects/series';
import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';
import providerHelper from '../../../src/backend/helpFunctions/provider/provider-helper';

describe('Provider: Kitsu | Test runs', () => {
    const kitsuProvider = new KitsuProvider();
    before(() => {
        // tslint:disable-next-line: no-string-literal
        MainListManager['listLoaded'] = true;
        // tslint:disable-next-line: no-string-literal
        MainListLoader['loadData'] = () => [];
        // tslint:disable-next-line: no-string-literal tslint:disable-next-line: no-empty
        MainListLoader['saveData'] = async () => { };
    });
    beforeEach(() => {
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = undefined;
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = undefined;
    });

    it('should get a series (1/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData();
        unkownProvider.addSeriesName(new Name('Sankarea', 'en'));
        series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await providerHelper['getProviderSeriesInfo'](series, kitsuProvider);
        strictEqual(result.getListProvidersInfos().length, 5);
    });

    it('should get a series (2/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData();
        unkownProvider.addSeriesName(new Name('Seitokai Yakuindomo＊', 'en'));
        series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await providerHelper['getProviderSeriesInfo'](series, kitsuProvider);
        strictEqual(result.getListProvidersInfos().length, 3);
    });

    it('should get a series (3/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData();
        unkownProvider.addSeriesName(new Name('The Asterisk War: The Academy City on the Water', 'en'));
        series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await providerHelper['getProviderSeriesInfo'](series, kitsuProvider);
        strictEqual(result.getListProvidersInfos().length, 5);
    });

    it('should get a series (4/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData();
        unkownProvider.addSeriesName(new Name('Little Witch Academia', 'en'));
        series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await providerHelper['getProviderSeriesInfo'](series, kitsuProvider);
        strictEqual(result.getListProvidersInfos().length, 5);
    });

    it('should get a series (5/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData();
        unkownProvider.addSeriesName(new Name('Avatar: The Last Airbender', 'en'));
        series.addProviderDatas(unkownProvider);

        const result = await providerHelper['getProviderSeriesInfo'](series, kitsuProvider);
        strictEqual(result.getListProvidersInfos().length, 5);
    });

    it('should get a series (6/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData();
        unkownProvider.addSeriesName(new Name('Naruto: Shippuuden', 'en'));
        series.addProviderDatas(unkownProvider);

        const result = await providerHelper['getProviderSeriesInfo'](series, kitsuProvider);
        strictEqual(result.getListProvidersInfos().length, 5);
    });

});
