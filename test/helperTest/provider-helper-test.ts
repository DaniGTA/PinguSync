import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager';

import MainListLoader from '../../src/backend/controller/main-list-manager/main-list-loader';

import ListController from '../../src/backend/controller/list-controller';

import ProviderList from '../../src/backend/controller/provider-manager/provider-list';

import TestProvider from '../controller/objects/testClass/testProvider';
import providerHelper from '../../src/backend/helpFunctions/provider/provider-helper';
import Series from '../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import { equal } from 'assert';


// tslint:disable: no-string-literal
describe('Provider-Helper | Examples', () => {
    before(() => {
        // tslint:disable-next-line: no-string-literal
        MainListManager['listLoaded'] = true;
        // tslint:disable-next-line: no-string-literal
        MainListLoader['loadData'] = () => [];
        // tslint:disable-next-line: no-string-literal tslint:disable-next-line: no-empty
        MainListLoader['saveData'] = async () => { };
        // tslint:disable-next-line: no-unused-expression
        new ListController(true);
    });
    beforeEach(() => {

        ProviderList['loadedListProvider'] = [new TestProvider('testA'), new TestProvider('testB')];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = [];
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [];
    });
    it('should check list provider id right', async () => {
        // Series A
        const series = new Series();
        const listProvider = new ListProviderLocalData(1, 'test');
        series.addProviderDatas(listProvider);

        // Series B
        const seriesB = new Series();
        const listProviderB = new ListProviderLocalData(1, 'test');
        seriesB.addProviderDatas(listProviderB);

        const result = await providerHelper.checkListProviderId(series, seriesB);
        equal(result.sameId, true);
    });


});
