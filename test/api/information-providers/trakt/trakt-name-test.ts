import ProviderList from '../../../../src/backend/controller/provider-controller/provider-manager/provider-list';
import TraktProvider from '../../../../src/backend/api/information-providers/trakt/trakt-provider';
import WebRequestManager from '../../../../src/backend/controller/web-request-manager/web-request-manager';

describe('Provider: Trakt | Username get tests', () => {
    const traktProviderInstance = ProviderList.getProviderInstanceByClass(TraktProvider);

    test('should get name', async ()=>{
        const response = {
            body: '{"username":"sean","private":false,"name":"Sean Rudford","vip":true,"vip_ep":true,"ids":{"slug":"sean"}}',
            statusCode: 200
        };

        WebRequestManager.request = jest.fn(async () => response) as any;
        traktProviderInstance.userData.username = 'Sean Rudford';
       const a = await traktProviderInstance.getUsername();
       expect(a).toBe('Sean Rudford');
    });

    test('should get username when name is missing', async ()=>{
        const response = {
            body: '{"username":"sean","private":false,"vip":true,"vip_ep":true,"ids":{"slug":"sean"}}',
            statusCode: 200
        };

        WebRequestManager.request = jest.fn(async () => response) as any;
        traktProviderInstance.userData.username = 'sean';
       const a = await traktProviderInstance.getUsername();
       expect(a).toBe('sean');
    });
});