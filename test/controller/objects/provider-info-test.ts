
import * as assert from 'assert';
import { ListProviderLocalData } from '../../../src/backend/controller/provider-controller/provider-manager/local-data/list-provider-local-data';
import { ListType } from '../../../src/backend/controller/settings/models/provider/list-types';

describe('Provider | Watchlist & Merge', () => {

    test('should merge same provider', async () => {
        const providerInfoA = new ListProviderLocalData(2);
        providerInfoA.episodes = 10;
        providerInfoA.score = 11;
        providerInfoA.watchStatus = ListType.CURRENT;
        providerInfoA.sequelIds.push(10);
        providerInfoA.lastUpdate = new Date(10000);
        const providerInfoB = new ListProviderLocalData(2);
        providerInfoB.episodes = 10;
        providerInfoB.score = 12;
        providerInfoB.watchStatus = ListType.COMPLETED;
        providerInfoB.sequelIds.push(12);
        providerInfoB.lastUpdate = new Date(20000);
        providerInfoB.publicScore = 15;
        providerInfoB.prequelIds.push(105);

        const providerMerged = await ListProviderLocalData.mergeProviderInfos(providerInfoA, providerInfoB);

        expect(providerMerged.sequelIds[0]).toBe(12);
        assert.equal(providerMerged.score, 12);
        assert.equal(providerMerged.watchStatus, ListType.COMPLETED);
        assert.equal(providerMerged.publicScore, 15);
        assert.equal(providerMerged.prequelIds, 105);
    });
});
