import { equal } from 'assert';
import KitsuProvider from '../../src/backend/api/kitsu/kitsu-provider';
import MalProvider from '../../src/backend/api/mal/mal-provider';
import ListProvider from '../../src/backend/api/provider/list-provider';
import ListController from '../../src/backend/controller/list-controller';
import MainListLoader from '../../src/backend/controller/main-list-manager/main-list-loader';
import MainListManager from '../../src/backend/controller/main-list-manager/main-list-manager';
import Series from '../../src/backend/controller/objects/series';
import { InfoProviderLocalData } from '../../src/backend/controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../src/backend/controller/provider-manager/provider-list';
import { ProviderHelper } from '../../src/backend/helpFunctions/provider/provider-helper';
import TestInfoProvider from '../controller/objects/testClass/testInfoProvider';
import TestProvider from '../controller/objects/testClass/testProvider';

describe('Provider Helper Test', () => {

    const lc = new ListController(true);

    before(() => {
        // tslint:disable: no-string-literal
        MainListManager['listLoaded'] = true;
        // tslint:disable-next-line: no-string-literal
        MainListLoader['loadData'] = () => [];
        // tslint:disable-next-line: no-string-literal tslint:disable-next-line: no-empty
        MainListLoader['saveData'] = async () => { };
    });
    beforeEach(() => {
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = [new KitsuProvider(), new MalProvider()];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = [new TestInfoProvider('test1'), new TestInfoProvider('test2'), new TestInfoProvider('test3')];
        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [];
        // tslint:disable-next-line: no-unused-expression
        new ListController(true);
    });

    it('It should find that it can get id from other provider', async () => {
        const providerHelper = new ProviderHelper();
        // Series A
        const series = new Series();
        const listProvider = new ListProviderLocalData(1, 'Kitsu');
        series.addProviderDatas(listProvider);
        const pList = ProviderList['loadedListProvider'];
        let provider: ListProvider | null = null;
        if (pList && pList[1]) {
            provider = pList[1];
        }
        let result;
        if (provider) {
            result = await providerHelper['canGetTargetIdFromCurrentProvider'](listProvider, provider);
        }
        equal(result, true);
    });

    it('It should get all list provider that need a update', async () => {
        const providerHelper = new ProviderHelper();
        // Series A
        const series = new Series();
        series.addProviderDatas(new InfoProviderLocalData(1, 'test1'));
        series.addProviderDatas(new InfoProviderLocalData(1, 'test2'));
        const result = await providerHelper['getInfoProviderThatNeedUpdates'](series.getAllProviderLocalDatas());
        equal(result.length, 1);
    });
});
