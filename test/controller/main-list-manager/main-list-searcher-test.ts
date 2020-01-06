import { strictEqual } from 'assert';
import MultiProviderResult from '../../../src/backend/api/provider/multi-provider-result';
import TraktProvider from '../../../src/backend/api/trakt/trakt-provider';
import ListController from '../../../src/backend/controller/list-controller';
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import MainListSearcher from '../../../src/backend/controller/main-list-manager/main-list-searcher';
import Series from '../../../src/backend/controller/objects/series';
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-manager/provider-list';
import TestHelper from '../../test-helper';
import TestProvider from '../objects/testClass/testProvider';

// tslint:disable: no-string-literal
describe('MainList | Searcher tests', () => {
    const lc = new ListController(true);

    beforeEach(() => {
        TestHelper.mustHaveBefore();
        ProviderList['loadedListProvider'] = [new TestProvider('Test'), new TestProvider('Test2')];
        ProviderList['loadedInfoProvider'] = [];
    });

    test('should find series', async () => {
        const searcher = new MainListSearcher();

        const series1 = new Series();
        const provider1 = new ListProviderLocalData(1, TraktProvider.getInstance().providerName);
        provider1.targetSeason = 1;
        series1.addListProvider(provider1);


        const series2 = new Series();
        const provider2 = new ListProviderLocalData(1, TraktProvider.getInstance().providerName);
        provider2.targetSeason = 2;
        series2.addListProvider(provider2);

        const series3 = new Series();
        const provider3 = new ListProviderLocalData(1, TraktProvider.getInstance().providerName);
        provider3.targetSeason = 1;
        series3.addListProvider(provider3);

        MainListManager['mainList'] = [series1, series2];

        const result = await searcher['quickFindSameSeriesInList'](series3, MainListManager['mainList']);

        strictEqual(result.length, 1);
    });
});
