import { strictEqual } from 'assert';
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import Series from '../../../src/backend/controller/objects/series';
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import TestProvider from '../objects/testClass/testProvider';

describe('MainListPackageManager', () => {
    beforeEach(() => {
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedListProvider'] = [new TestProvider('Test'), new TestProvider('Test2')];
        // tslint:disable-next-line: no-string-literal
        ProviderList['loadedInfoProvider'] = [];
    });

    test('should simply add the series to the main list.', async () => {
        const series = new Series();
        await series.addProviderDatas(new InfoProviderLocalData(1, 'Test'));
        const result = await MainListManager.addSerieToMainList(series);

        strictEqual(result, true);
        strictEqual(await (await MainListManager.getMainList()).length, 1);
    });
});
