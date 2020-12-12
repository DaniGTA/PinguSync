import MultiProviderResult from '../../../src/backend/api/provider/multi-provider-result';
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import MainListEntryUpdater from '../../../src/backend/controller/main-list-manager/main-list-updater';
import Series from '../../../src/backend/controller/objects/series';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import TestListProvider from '../objects/testClass/testListProvider';


describe('MainList | Entry update tests', () => {
    beforeEach(() => {
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = [new TestListProvider('Test'), new TestListProvider('Test2')];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = [];
    });

    test('should update provider', async () => {
        const seriesA = new Series();
        const providerA = new ListProviderLocalData('test', 'Test');
        await seriesA.addProviderDatas(providerA);

        // tslint:disable-next-line: no-string-literal
        MainListManager['mainList'] = [seriesA];

        const providerB = new ListProviderLocalData('test', 'Test');
        providerB.episodes = 10;
        const mpr = new MultiProviderResult(providerB);

        // Testing
        await new MainListEntryUpdater().updateMultiProviderData(mpr);

        // tslint:disable-next-line: no-string-literal
        expect(MainListManager['mainList'].length).toBe(1);
        // tslint:disable-next-line: no-string-literal
        expect(MainListManager['mainList'][0].getMaxEpisode()).toBe(10);
    });
});
