import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import Series from '../../../src/backend/controller/objects/series';
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import TestInfoProvider from '../objects/testClass/testInfoProvider';
import TestListProvider from '../objects/testClass/testListProvider';
import TestListProvider2 from '../objects/testClass/testListProvider2';

describe('MainListPackageManager', () => {
    beforeEach(() => {
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = [new TestListProvider(), new TestListProvider2()];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = [];
    });

    test('should simply add the series to the main list.', async () => {
        const series = new Series();
        series.addProviderDatas(new InfoProviderLocalData(1, TestInfoProvider));
        const result = await MainListManager.addSerieToMainList(series);

        expect(result).toBe(true);
        expect(MainListManager.getMainList().length).toBe(1);
    });
});
