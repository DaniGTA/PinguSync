import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import Series from '../../../src/backend/controller/objects/series';
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import TestListProvider from '../objects/testClass/testListProvider';

describe('MainListPackageManager', () => {
    beforeEach(() => {
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = [new TestListProvider('Test'), new TestListProvider('Test2')];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = [];
    });

    test('should simply add the series to the main list.', async () => {
        const series = new Series();
        series.addProviderDatas(new InfoProviderLocalData(1, 'Test'));
        const result = await MainListManager.addSerieToMainList(series);

        expect(result).toBe(true);
        expect(MainListManager.getMainList().length).toBe(1);
    });
});
