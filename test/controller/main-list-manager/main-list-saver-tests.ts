import { equal } from 'assert';
import { existsSync } from 'fs';
import MainListManager from '../../../src/backend/controller/main-list-manager/main-list-manager';
import MainListPath from '../../../src/backend/controller/main-list-manager/main-list-path';
import InfoLocalDataBind from '../../../src/backend/controller/objects/extension/provider-extension/binding/info-local-data-bind';
import ListLocalDataBind from '../../../src/backend/controller/objects/extension/provider-extension/binding/list-local-data-bind';
import Season from '../../../src/backend/controller/objects/meta/season';
import Series from '../../../src/backend/controller/objects/series';
import { InfoProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/info-provider-local-data';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';

describe('Main list saver tests', () => {
    beforeEach(() => {
        MainListPath.getPath = () => './test/controller/main-list-manager/files/saved-list.json';
    });

    test('should save file', async () => {
        const a = new Series();
        a.addInfoProviderBindings(new InfoLocalDataBind(new InfoProviderLocalData(1, 'Test'), new Season(1)));
        a.addListProviderBindings(new ListLocalDataBind(new ListProviderLocalData(2, 'Test')));
        await MainListManager.addSerieToMainList(a);

        MainListManager.requestSaveMainList();

        expect(existsSync(MainListPath.getPath())).toBeTruthy();
    });
});
