import { strictEqual } from 'assert';
import ProviderDataListManager from '../../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager';
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import { ProviderInfoStatus } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import ProviderList from '../../../src/backend/controller/provider-controller/provider-manager/provider-list';

import TestProvider from '../objects/testClass/testProvider';
// tslint:disable: no-string-literal
describe('Provider data manager list tests', () => {
    beforeEach(() => {
        ProviderList['loadedListProvider'] = [new TestProvider('Test'), new TestProvider('Test2')];
        ProviderList['loadedInfoProvider'] = [];
    });

    test('should update list provider and hold the right info status', async () => {
        const provider = new ListProviderLocalData(1, 'test');
        provider.infoStatus = ProviderInfoStatus.FULL_INFO;
        provider.runTime = 10;
        provider.lastUpdate = new Date(0);
        provider.isNSFW = false;

        await ProviderDataListManager.addProviderLocalDataToMainList(provider);

        const newProvider = new ListProviderLocalData(1, 'test');
        newProvider.infoStatus = ProviderInfoStatus.ONLY_ID;
        newProvider.lastUpdate = new Date(1);
        await ProviderDataListManager['updateProviderInList'](newProvider);

        strictEqual(ProviderDataListManager['providerDataList'].length, 1);
        strictEqual(ProviderDataListManager['providerDataList'][0].infoStatus, ProviderInfoStatus.FULL_INFO);
        strictEqual(ProviderDataListManager['providerDataList'][0].runTime, 10);
        strictEqual(ProviderDataListManager['providerDataList'][0].isNSFW, false);
    });

    test('should update info provider and hold the right info status', async () => {
        const provider = new InfoProviderLocalData(1, 'test');
        provider.infoStatus = ProviderInfoStatus.FULL_INFO;
        provider.runTime = 10;
        provider.isNSFW = false;

        await ProviderDataListManager.addProviderLocalDataToMainList(provider);

        const newProvider = new InfoProviderLocalData(1, 'test');
        newProvider.infoStatus = ProviderInfoStatus.ONLY_ID;

        await ProviderDataListManager['updateProviderInList'](newProvider);

        strictEqual(ProviderDataListManager['providerDataList'].length, 1);
        strictEqual(ProviderDataListManager['providerDataList'][0].infoStatus, ProviderInfoStatus.FULL_INFO);
        strictEqual(ProviderDataListManager['providerDataList'][0].runTime, 10);
        strictEqual(ProviderDataListManager['providerDataList'][0].isNSFW, false);
    });

});
