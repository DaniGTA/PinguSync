import { strictEqual } from 'assert';
import InfoLocalDataBind from '../../../src/backend/controller/objects/extension/provider-extension/binding/info-local-data-bind';
import ListLocalDataBind from '../../../src/backend/controller/objects/extension/provider-extension/binding/list-local-data-bind';
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';

describe('localdata binding tests', () => {
    test('should save list binding instance type in string', () => {
        const listBind = new ListLocalDataBind(new ListProviderLocalData(1, ''));
        expect(listBind.instanceName).toBe('ListLocalDataBind');
        strictEqual(listBind.providerName, '');
        strictEqual(listBind.id, 1);
    });

    test('should save info binding instance type in string', () => {
        const infoBind = new InfoLocalDataBind(new InfoProviderLocalData(1, ''));
        expect(infoBind.instanceName).toBe('InfoLocalDataBind');
        strictEqual(infoBind.providerName, '');
        strictEqual(infoBind.id, 1);
    });
});
