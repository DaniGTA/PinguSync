import { strictEqual } from 'assert';
import { isDeepStrictEqual } from 'util';
import Episode from '../../../src/backend/controller/objects/meta/episode/episode';
import Name from '../../../src/backend/controller/objects/meta/name';
import ProviderDataListManager from '../../../src/backend/controller/provider-controller/provider-data-list-manager/provider-data-list-manager';
import { ProviderInfoStatus } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/interfaces/provider-info-status';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import { ListType } from '../../../src/backend/controller/settings/models/provider/list-types';

// tslint:disable: no-string-literal
describe('Provider data list manager tests', () => {
    beforeEach(() => {
        ProviderDataListManager['providerDataList'] = [];
    });

    test('It should update provider data in list', async () => {
        const oldProvider = new ListProviderLocalData(1, 'test');
        await ProviderDataListManager.addProviderLocalDataToMainList(oldProvider);

        const newProvider = new ListProviderLocalData(1, 'test');
        newProvider.detailEpisodeInfo.push(new Episode(1));
        newProvider.watchStatus = ListType.COMPLETED;
        newProvider.infoStatus = ProviderInfoStatus.BASIC_INFO;
        newProvider.addSeriesName(new Name('A', 'A'));

        await ProviderDataListManager.addProviderLocalDataToMainList(newProvider);

        strictEqual(ProviderDataListManager['providerDataList'].length, 1);
        isDeepStrictEqual(ProviderDataListManager['providerDataList'][0], newProvider);
    });

    test('It should not downgrade existing data', async () => {
        const oldProvider = new ListProviderLocalData(1, 'test');
        await ProviderDataListManager.addProviderLocalDataToMainList(oldProvider);

        const newProvider = new ListProviderLocalData(1, 'test');
        newProvider.detailEpisodeInfo.push(new Episode(1));
        newProvider.watchStatus = ListType.COMPLETED;
        newProvider.infoStatus = ProviderInfoStatus.BASIC_INFO;
        newProvider.addSeriesName(new Name('A', 'A'));

        await ProviderDataListManager.addProviderLocalDataToMainList(newProvider);
        await ProviderDataListManager.addProviderLocalDataToMainList(oldProvider);

        strictEqual(ProviderDataListManager['providerDataList'].length, 1);
        isDeepStrictEqual(ProviderDataListManager['providerDataList'][0], newProvider);
    });
});
