

import { strictEqual, fail } from 'assert';
import KitsuProvider from '../../../src/backend/api/kitsu/kitsu-provider';
import MainListLoader from '../../../src/backend/controller/main-list-manager/main-list-loader';
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import Name from '../../../src/backend/controller/objects/meta/name';
import Series from '../../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';
import providerInfoDownloaderhelper from '../../../src/backend/helpFunctions/provider/provider-info-downloader/provider-info-downloaderhelper';

// tslint:disable: no-string-literal
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
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Sankarea', 'en'));
        await series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await providerInfoDownloaderhelper['getProviderSeriesInfo'](series, kitsuProvider);
        strictEqual(result.getAllProviders().length, 5);
    });

    it('should get a series (2/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Seitokai Yakuindomo＊', 'en'));
        await series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await providerInfoDownloaderhelper['getProviderSeriesInfo'](series, kitsuProvider);
        strictEqual(result.getAllProviders().length, 3);
    });

    it('should get a series (3/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('The Asterisk War: The Academy City on the Water', 'en'));
        await series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await providerInfoDownloaderhelper['getProviderSeriesInfo'](series, kitsuProvider);
        strictEqual(result.getAllProviders().length, 5);
    }).timeout(4000);

    it('should get a series (4/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Little Witch Academia', 'en'));
        await series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await providerInfoDownloaderhelper['getProviderSeriesInfo'](series, kitsuProvider);
        const kitsuResult = result.getAllProviders().find((x) => x.provider === kitsuProvider.providerName);
        if (kitsuResult) {
            strictEqual(kitsuResult.provider, kitsuProvider.providerName);
            strictEqual(kitsuResult.id, '12272');
        } else {
            fail('No kitsu result');
        }
    }).timeout(4000);

    it('should get a series (5/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Avatar: The Last Airbender', 'en'));
        await series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await providerInfoDownloaderhelper['getProviderSeriesInfo'](series, kitsuProvider);
        strictEqual(result.getAllProviders().length, 5);
    }).timeout(4000);

    it('should get a series (6/6)', async () => {

        const series = new Series();
        const unkownProvider = new ListProviderLocalData(-1);
        unkownProvider.addSeriesName(new Name('Naruto: Shippuuden', 'en'));
        await series.addProviderDatas(unkownProvider);

        // tslint:disable-next-line: no-string-literal
        const result = await providerInfoDownloaderhelper['getProviderSeriesInfo'](series, kitsuProvider);
        strictEqual(result.getAllProviders().length, 5);
    }).timeout(4000);

});
