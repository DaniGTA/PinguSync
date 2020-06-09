import ProviderList from '../../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import TraktProvider from '../../../../src/backend/api/information-providers/trakt/trakt-provider';

describe('Provider: Trakt | Username get tests', () => {
    const traktProviderInstance = ProviderList.getProviderInstanceByClass(TraktProvider);

    test('should get username', async ()=>{
       const a = await traktProviderInstance.getUsername();
       expect(a).toBe('alvorninha');
    });
});