import InfoLocalDataBind from '../../../src/backend/controller/objects/extension/provider-extension/binding/info-local-data-bind';
import ListLocalDataBind from '../../../src/backend/controller/objects/extension/provider-extension/binding/list-local-data-bind';
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import TestListProvider from './testClass/testListProvider';
import TestInfoProvider from './testClass/testInfoProvider';

describe('localdata binding tests', () => {
    test('should save list binding instance type in string', () => {
        const listBind = new ListLocalDataBind(new ListProviderLocalData(1, TestListProvider));
        expect(listBind.instanceName).toBe('ListLocalDataBind');
        expect(listBind.providerName).toBe('');
        expect(listBind.id).toBe(1);
    });

    test('should save info binding instance type in string', () => {
        const infoBind = new InfoLocalDataBind(new InfoProviderLocalData(1, TestInfoProvider));
        expect(infoBind.instanceName).toBe('InfoLocalDataBind');
        expect(infoBind.providerName).toBe('');
        expect(infoBind.id).toBe(1);
    });
});
