import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager';

import MainListLoader from '../../src/backend/controller/main-list-manager/main-list-loader';

import ListController from '../../src/backend/controller/list-controller';

import ProviderList from '../../src/backend/controller/provider-manager/provider-list';

import { equal } from 'assert';
import Series from '../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../src/backend/controller/provider-manager/local-data/list-provider-local-data';

import providerInfoDownloaderhelper from '../../src/backend/helpFunctions/provider/provider-info-downloader/provider-info-downloaderhelper';
import TestProvider from '../controller/objects/testClass/testProvider';
import TestHelper from '../test-helper';


// tslint:disable: no-string-literal
describe('Provider Helper | Examples', () => {
    beforeAll(() => {
        TestHelper.mustHaveBefore();
    });
    beforeEach(() => {

        ProviderList['loadedListProvider'] = [new TestProvider('testA'), new TestProvider('testB')];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = [];
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [];
    });
    test('should check list provider id true', async () => {
        // Series A
        const series = new Series();
        const listProvider = new ListProviderLocalData(1, 'testA');
        await series.addProviderDatas(listProvider);

        // Series B
        const seriesB = new Series();
        const listProviderB = new ListProviderLocalData(1, 'testA');
        await seriesB.addProviderDatas(listProviderB);

        const result = await providerInfoDownloaderhelper.checkListProviderId(series, seriesB);
        equal(result.sameId, true);
    });

    test('should check list provider id false (Provider not equal)', async () => {
        // Series A
        const series = new Series();
        const listProvider = new ListProviderLocalData(1, 'testA');
        series.addProviderDatas(listProvider);

        // Series B
        const seriesB = new Series();
        const listProviderB = new ListProviderLocalData(1, 'testB');
        seriesB.addProviderDatas(listProviderB);

        const result = await providerInfoDownloaderhelper.checkListProviderId(series, seriesB);
        equal(result.sameId, false);
    });

    test('should check list provider id false (Id not equal)', async () => {
        // Series A
        const series = new Series();
        const listProvider = new ListProviderLocalData(1, 'testA');
        series.addProviderDatas(listProvider);

        // Series B
        const seriesB = new Series();
        const listProviderB = new ListProviderLocalData(2, 'testA');
        seriesB.addProviderDatas(listProviderB);

        const result = await providerInfoDownloaderhelper.checkListProviderId(series, seriesB);
        equal(result.sameId, false);
    });

    test('should check list provider id false (Provider not exist)', async () => {
        // Series A
        const series = new Series();
        const listProvider = new ListProviderLocalData(1, 'testC');
        series.addProviderDatas(listProvider);

        // Series B
        const seriesB = new Series();
        const listProviderB = new ListProviderLocalData(1, 'testC');
        seriesB.addProviderDatas(listProviderB);

        const result = await providerInfoDownloaderhelper.checkListProviderId(series, seriesB);
        equal(result.sameId, false);
    });



});
